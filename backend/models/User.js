import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true, enum: ['admin', 'user'] },
    isBlocked: { type: Boolean, default: false }
});

/* 
User.schema.methods.logIn = async function(email, password) {
    console.log('Logging in from User class');
    // Custom logic for User logIn
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

//change the logic of adding
User.schema.methods.addPanel = function(panelId) {
    this.panels.push(panelId);
    return this.save();
};

//change the logic of adding
User.schema.methods.addBattery = function(batteryId) {
    this.batteries.push(batteryId);
    return this.save();
};

User.schema.methods.calculateCurrentConsumption = function() {
    // Calculate current consumption logic
};

User.schema.methods.saveConsumptionData = function(data) {
    // Save consumption data logic
}; */

const UserModel = mongoose.model('users', UserSchema);
export default UserModel;
