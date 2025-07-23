import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Task, TaskSchema } from './task.schema';

@Schema({ timestamps: true })
export class TodoList extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, required: false })
  emoji?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [TaskSchema], default: [] })
  tasks: Task[];

  createdAt: Date;
  updatedAt: Date;
}

export const TodoListSchema = SchemaFactory.createForClass(TodoList);

// Add index for userId for better query performance
TodoListSchema.index({ userId: 1 });