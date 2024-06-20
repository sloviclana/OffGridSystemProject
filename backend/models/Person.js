import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: {type: String, enum: ['ADMIN', 'USER'] }
} );


PersonSchema.statics.register = async function({ name, surname, email, password, userType }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    if (userType === 'ADMIN') {
        return await Admin.create({ name, surname, email, password: hashedPassword, userType });
      } else if (userType === 'USER') {
        return await User.create({ name, surname, email, password: hashedPassword, userType });
      } else {
        throw new Error('Invalid userType');
      }
      
  };
  
  // Static method for logging in a user
PersonSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new Error('Invalid password');
    }
    //const token = jwt.sign({ userId: user._id, userType: user.userType }, 'your_jwt_secret');
    return { user, token };
};

const Person = mongoose.model('Person', PersonSchema);

module.exports = Person;