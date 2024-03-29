import { Schema, model, Types } from 'mongoose';

export interface IUser {
  id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  friends: Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number },
    friends: { type: [Schema.Types.ObjectId], ref: 'User' }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

userSchema.virtual<IUser>('name').get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('id').get(function returnIdField() {
  return this._id.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true
});

export default model<IUser>('User', userSchema);
