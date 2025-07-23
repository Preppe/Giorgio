import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AiAgentModule } from './ai-agent/ai-agent.module';
import { AuthModule } from './auth/auth.module';
import { MemoryModule } from './memory/memory.module';
import { S3Module } from './s3/s3.module';
import { TodoListModule } from './todo-list/todo-list.module';
import { UsersModule } from './users/users.module';
import { VoiceModule } from './voice/voice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/giorgio?authSource=admin'),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '5m' },
    }),
    AiAgentModule,
    VoiceModule,
    AuthModule,
    UsersModule,
    TodoListModule,
    MemoryModule,
    S3Module,
  ],
})
export class AppModule {}
