import { Schema, model, Document, Types } from 'mongoose';

export interface NotificationTypes {
  marketUpdate: boolean;
  listingCreated: boolean;
  listingSold: boolean;
  system: boolean;
}

export interface INotificationPreference extends Document {
  userId: Types.ObjectId;
  enabled: boolean;
  types: NotificationTypes;
  createdAt: Date;
  updatedAt: Date;
}

export const defaultNotificationTypes: NotificationTypes = {
  marketUpdate: true,
  listingCreated: true,
  listingSold: true,
  system: true,
};

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    enabled: { type: Boolean, required: true, default: true },
    types: {
      marketUpdate: { type: Boolean, default: true },
      listingCreated: { type: Boolean, default: true },
      listingSold: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const NotificationPreferenceModel = model<INotificationPreference>(
  'NotificationPreference',
  NotificationPreferenceSchema
);


