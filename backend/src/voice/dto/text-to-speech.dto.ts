import { IsString, IsOptional } from 'class-validator';

export class TextToSpeechDto {
  @IsString()
  text: string;

  @IsString()
  modelId: string;

  @IsOptional()
  @IsString()
  voiceId?: string;

  @IsOptional()
  @IsString()
  outputFormat?: string;

  @IsOptional()
  voiceSettings?: Record<string, any>;
}