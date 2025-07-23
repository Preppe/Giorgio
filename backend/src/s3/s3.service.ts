import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadFileDto } from './dto/upload.dto';
import { DownloadFileDto } from './dto/download.dto';
import { DeleteFileDto } from './dto/delete.dto';
import { ListObjectsDto } from './dto/list.dto';
import { GeneratePresignedUrlDto } from './dto/presigned-url.dto';

interface S3UploadResult {
  key: string;
  bucket: string;
  location: string;
  etag: string;
}

interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
}

interface S3ListResult {
  objects: S3Object[];
  isTruncated: boolean;
  nextContinuationToken?: string;
}

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private defaultBucket: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    const region = this.configService.get<string>('S3_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID', 'minioadmin');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY', 'minioadmin123');
    
    this.defaultBucket = this.configService.get<string>('S3_DEFAULT_BUCKET', 'giorgio-storage');

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists(this.defaultBucket);
    this.logger.log(`S3Service initialized with bucket: ${this.defaultBucket}`);
  }

  private async ensureBucketExists(bucket: string): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
      this.logger.log(`Bucket '${bucket}' exists`);
    } catch (error) {
      if (error.name === 'NoSuchBucket' || error.name === 'NotFound') {
        this.logger.log(`Creating bucket '${bucket}'`);
        await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
        this.logger.log(`Bucket '${bucket}' created successfully`);
      } else {
        this.logger.error(`Error checking bucket '${bucket}':`, error.message);
        throw error;
      }
    }
  }

  async uploadFile(
    file: Buffer,
    options: UploadFileDto,
  ): Promise<S3UploadResult> {
    const bucket = options.bucket || this.defaultBucket;
    
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: options.key,
        Body: file,
        ContentType: options.contentType,
        Metadata: options.metadata,
      });

      const result = await this.s3Client.send(command);
      
      this.logger.log(`File uploaded successfully: ${options.key}`);
      
      return {
        key: options.key,
        bucket,
        location: `${bucket}/${options.key}`,
        etag: result.ETag || '',
      };
    } catch (error) {
      this.logger.error(`Failed to upload file '${options.key}':`, error.message);
      throw error;
    }
  }

  async downloadFile(options: DownloadFileDto): Promise<Buffer> {
    const bucket = options.bucket || this.defaultBucket;
    
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: options.key,
      });

      const result = await this.s3Client.send(command);
      
      if (!result.Body) {
        throw new Error('No file content received');
      }

      const chunks: Uint8Array[] = [];
      const stream = result.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      this.logger.log(`File downloaded successfully: ${options.key}`);
      
      return buffer;
    } catch (error) {
      this.logger.error(`Failed to download file '${options.key}':`, error.message);
      throw error;
    }
  }

  async deleteFile(options: DeleteFileDto): Promise<void> {
    const bucket = options.bucket || this.defaultBucket;
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: options.key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${options.key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file '${options.key}':`, error.message);
      throw error;
    }
  }

  async listObjects(options: ListObjectsDto = {}): Promise<S3ListResult> {
    const bucket = options.bucket || this.defaultBucket;
    
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: options.prefix,
        MaxKeys: options.maxKeys || 1000,
        ContinuationToken: options.continuationToken,
      });

      const result = await this.s3Client.send(command);
      
      const objects: S3Object[] = (result.Contents || []).map((obj) => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date(),
        etag: obj.ETag || '',
      }));

      this.logger.log(`Listed ${objects.length} objects from bucket '${bucket}'`);
      
      return {
        objects,
        isTruncated: result.IsTruncated || false,
        nextContinuationToken: result.NextContinuationToken,
      };
    } catch (error) {
      this.logger.error(`Failed to list objects in bucket '${bucket}':`, error.message);
      throw error;
    }
  }

  async generatePresignedUrl(options: GeneratePresignedUrlDto): Promise<string> {
    const bucket = options.bucket || this.defaultBucket;
    const expiresIn = options.expiresIn || 3600; // 1 hour default
    const operation = options.operation || 'getObject';
    
    try {
      let command: PutObjectCommand | GetObjectCommand;
      
      if (operation === 'putObject') {
        command = new PutObjectCommand({
          Bucket: bucket,
          Key: options.key,
        });
      } else {
        command = new GetObjectCommand({
          Bucket: bucket,
          Key: options.key,
        });
      }

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      
      this.logger.log(`Generated presigned URL for '${options.key}' (${operation})`);
      
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for '${options.key}':`, error.message);
      throw error;
    }
  }

  async fileExists(key: string, bucket?: string): Promise<boolean> {
    const bucketName = bucket || this.defaultBucket;
    
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  getDefaultBucket(): string {
    return this.defaultBucket;
  }
}