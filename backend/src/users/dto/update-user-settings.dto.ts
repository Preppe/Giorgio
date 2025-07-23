import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum VoiceEngine {
  GOOGLE = 'google',
  ELEVENLABS = 'elevenlabs',
  NATIVE = 'native',
}

export class VoicePreferencesDto {
  @IsOptional()
  @IsEnum(VoiceEngine, { message: 'engine must be either google, elevenlabs, or native' })
  engine?: VoiceEngine;

  @IsOptional()
  @IsString()
  voice?: string;

  @IsOptional()
  @IsString()
  apikey?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  modelId?: string;
}

export class PreferencesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => VoicePreferencesDto)
  voice?: VoicePreferencesDto;
}

export class UpdateUserSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;
}
