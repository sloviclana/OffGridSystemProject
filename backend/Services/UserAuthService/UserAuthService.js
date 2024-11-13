import mongoose from "mongoose";
import UserModel from "../../models/User.js";
import bcrypt from 'bcrypt';

const UserAuthService = {
    register : async(req, res) => {
        const { email, password } = req.body;

        try {
        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists!" });
        } else {
            // hashing the password
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await UserModel.create({ ...req.body, password: hashedPassword });
            return res.status(201).json(newUser);
        }
        } catch (err) {
        return res.status(500).json({ message: "Error with creating new user! Try again.", error: err });
        }
    }, 

    login : async (req, res) => {
        const { email, password } = req.body;
        const users = await UserModel.find();
        try {
        const user = await UserModel.findOne({ email: email });
        if (user) {
            // Provera da li je korisnik blokiran
            if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account is currently blocked. Please contact customer service.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
            return res.json({ message: "Successfull login", type: user.userType, user: user });
            } else {
            return res.json({ message: "The password is incorrect" });
            }
        } else {
            return res.json({ message: "User with this email does not exist!" });
        }
        } catch (err) {
        return res.status(500).json({ message: "Error with searching users.", error: err });
        }
    }, 

    updateUserStatus: async (req, res) => {
        const { userId, blocked } = req.body;

        try {
            const updateData = { isBlocked: blocked };
            const userForBlocking = await UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
            res.status(200).json({ message: 'Status updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update status' });
        }
    }
};


export default UserAuthService;