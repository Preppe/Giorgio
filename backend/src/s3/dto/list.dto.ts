import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class ListObjectsDto {
  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxKeys?: number;

  @IsOptional()
  @IsString()
  continuationToken?: string;
}