import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, unique: true })
  threadId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [
      {
        content: String,
        role: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  messages: { content: string; role: string; timestamp: Date }[];

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop({ default: 0 })
  messageCount: number;

  @Prop({ default: 0 })
  step: number;

  @Prop({ maxlength: 255 })
  description?: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
