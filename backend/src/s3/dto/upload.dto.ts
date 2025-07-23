import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  metadata?: Record<string, string>;
}