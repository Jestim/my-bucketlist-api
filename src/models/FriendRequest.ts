import { Schema, model, Types } from 'mongoose';

export interface IFriendRequest {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'pending' | 'rejected';
}

const friendRequestSchema = new Schema<IFriendRequest>({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true }
});

export default model<IFriendRequest>('FriendRequest', friendRequestSchema);
