import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  pseudonyme: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop({ type: Object })
  address: {
    street: string;
    city: string;
    country: string;
  };

  @Prop()
  comment: string;

  @Prop()
  lastConxAt: Date;

  @Prop({ required: true })
  role: 'admin' | 'user';
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ 'address.street':  "text", 'address.city':  "text", 'address.country': "text",'pseudonyme': "text",
  'name': "text",'comment': "text", });
