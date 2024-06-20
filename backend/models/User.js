import mongoose from 'mongoose';

const User = Person.discriminator('User',
    new Schema({
        isBlocked: Boolean,
        panels: [{ type: Schema.Types.ObjectId, ref: 'Panel' }],
        batteries: [{ type: Schema.Types.ObjectId, ref: 'Battery' }],
        currentConsumption: Number,
        historyOfConsumption: [{ type: Schema.Types.ObjectId, ref: 'ConsumptionHistoryData' }],
        historyOfProduction: [{ type: Schema.Types.ObjectId, ref: 'ProductionHistoryData' }]
    })
);

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
};


module.exports = User;
