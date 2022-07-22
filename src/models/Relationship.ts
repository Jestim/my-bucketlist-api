import { Schema, model, Types } from 'mongoose';

export interface IRelationship {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'accepted' | 'pending' | 'rejected';
}

const relationshipSchema = new Schema<IRelationship>({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true }
});

export default model<IRelationship>('Relationship', relationshipSchema);
