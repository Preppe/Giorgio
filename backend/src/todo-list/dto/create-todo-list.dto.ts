import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTodoListDto {
  @ApiProperty({
    description: 'Name of the todo list',
    example: 'Shopping List',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Emoji for the list',
    example: '🛒',
    required: false,
  })
  @IsString()
  @IsOptional()
  emoji?: string;
}