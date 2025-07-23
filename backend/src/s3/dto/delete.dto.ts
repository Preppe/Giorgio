import { IsOptional, IsString } from 'class-validator';

export class DeleteFileDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  bucket?: string;
}