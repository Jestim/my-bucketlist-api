import { Schema, model, Types } from 'mongoose';

export interface IGoal {
  title: string;
  description: string;
  location: string;
  sharedWith: Types.ObjectId[];
  isPrivate: boolean;
  isCrossedOff: boolean;
  crossedOffAt: Date;
  creator: Types.ObjectId;
}

const goalSchema = new Schema<IGoal>(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    sharedWith: { type: [Schema.Types.ObjectId], ref: 'User' },
    isPrivate: { type: Boolean, required: true, default: false },
    isCrossedOff: { type: Boolean, required: true, default: false },
    crossedOffAt: { type: Date },
    creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

goalSchema.virtual('id').get(function returnIdField() {
  return this._id.toHexString();
});

goalSchema.set('toJSON', {
  virtuals: true
});

export default model<IGoal>('Goal', goalSchema);
