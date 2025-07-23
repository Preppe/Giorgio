import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [],
  providers: [MemoryService],
  exports: [MemoryService],
})
export class MemoryModule {}