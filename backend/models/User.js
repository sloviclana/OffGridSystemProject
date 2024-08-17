import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true, enum: ['admin', 'user'] },
    isBlocked: { type: Boolean, default: false }
});

const UserModel = mongoose.model('users', UserSchema);
export default UserModel;
