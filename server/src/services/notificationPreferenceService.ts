import { Types } from 'mongoose';
import { NotificationPreferenceModel, INotificationPreference, defaultNotificationTypes } from '../models/NotificationPreference';

export async function getOrCreateDefault(userId: string | Types.ObjectId): Promise<INotificationPreference> {
  const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
  let pref = await NotificationPreferenceModel.findOne({ userId: userObjectId }).exec();
  if (!pref) {
    pref = await NotificationPreferenceModel.create({
      userId: userObjectId,
      enabled: true,
      types: { ...defaultNotificationTypes },
    });
  }
  return pref;
}

type UpdatePayload = Partial<Pick<INotificationPreference, 'enabled'>> & {
  types?: Partial<{ [K in keyof typeof defaultNotificationTypes]: boolean }>;
};

export async function updatePreferences(userId: string | Types.ObjectId, payload: UpdatePayload): Promise<INotificationPreference> {
  const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
  const $set: any = {};

  if (typeof payload.enabled === 'boolean') {
    $set.enabled = payload.enabled;
  }
  if (payload.types) {
    for (const key of Object.keys(defaultNotificationTypes) as Array<keyof typeof defaultNotificationTypes>) {
      if (typeof payload.types[key] === 'boolean') {
        $set[`types.${key}`] = payload.types[key];
      }
    }
  }

  const updated = await NotificationPreferenceModel.findOneAndUpdate(
    { userId: userObjectId },
    Object.keys($set).length ? { $set } : {},
    { new: true, upsert: true }
  ).exec();
  // upsert guarantees a doc
  return updated as INotificationPreference;
}

export async function resetPreferences(userId: string | Types.ObjectId): Promise<void> {
  const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
  await NotificationPreferenceModel.deleteOne({ userId: userObjectId }).exec();
}


