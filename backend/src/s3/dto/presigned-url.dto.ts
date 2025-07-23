import { IsOptional, IsString, IsNumber, IsIn, Min, Max } from 'class-validator';

export class GeneratePresignedUrlDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(604800) // Max 7 days
  expiresIn?: number;

  @IsOptional()
  @IsIn(['getObject', 'putObject'])
  operation?: 'getObject' | 'putObject';
}