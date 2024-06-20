import mongoose from 'mongoose';

const Admin = Person.discriminator('ADMIN');


// Override the logIn method in the Admin schema
Admin.schema.methods.logIn = async function(email, password) {
    console.log('Logging in from Admin class');
    // Custom logic for Admin logIn
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

Admin.schema.methods.blockUser = function(email) {
    return User.findByIdAndUpdate(email, { isBlocked: true });
};

Admin.schema.methods.getAllPanels = function() {
    return Panel.find({});
};

Admin.schema.methods.getAllBatteries = function() {
    return Battery.find({});
};

Admin.schema.methods.disablePanel = function(panelId) {
    return Panel.findByIdAndUpdate(panelId, { isEnabled: false });
};

Admin.schema.methods.setConstParameter = function(parameter) {
    // Set const parameter logic
};

module.exports = Admin;