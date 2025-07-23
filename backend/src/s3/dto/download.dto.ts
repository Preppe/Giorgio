import { IsOptional, IsString } from 'class-validator';

export class DownloadFileDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  bucket?: string;
}