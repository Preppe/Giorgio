import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class VoicePreferences {
  @Prop({ default: 'google' })
  engine: string;

  @Prop()
  voice?: string;

  @Prop()
  apikey?: string;

  @Prop({ default: 'it-IT' })
  language?: string;

  @Prop()
  modelId?: string;
}

@Schema()
class Preferences {
  @Prop({ type: VoicePreferences, default: {} })
  voice: VoicePreferences;
}

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name?: string;

  @Prop({ type: Preferences, default: {} })
  preferences: Preferences;
}

export const UserSchema = SchemaFactory.createForClass(User);
