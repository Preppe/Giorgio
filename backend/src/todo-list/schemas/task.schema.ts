import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: true, timestamps: false })
export class Task extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ type: String, required: false, default: null })
  category: string | null;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    required: false,
    default: null 
  })
  priority: 'high' | 'medium' | 'low' | null;
}

export const TaskSchema = SchemaFactory.createForClass(Task);