import mongoose from "mongoose";
import UserModel from "../../models/User.js";
import PanelModel from "../../models/Panel.js";
import BatteryModel from "../../models/Battery.js";
import ConstantParametersModel from "../../models/ConstantParameters.js";
import axios from "axios";

const UsersService = {
    getAllUsers: async(req, res) => {

        try {
            console.log(req.body);
            const currenUserId = req.query.id;

            const allUsers = await UserModel.find({userType: 'user'});

            const filteredUsers = allUsers.filter(user => user._id.toString() !== currenUserId);
            return res.status(201).json(filteredUsers);
        }
        catch (error) {
            return res.status(500).json({ message: "Error with getting info about all users! Try again.", error: err });
        }
    }, 

    blockUser: async(req, res) => {
        try {
            console.log(req.body);
            const authorizationHeader = req.body.headers.Authorization;
            let token = '';

            // Proveri da li postoji `Authorization` header i izvuci token
            if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
                token = authorizationHeader.split(' ')[1];
                console.log(token);
            } else {
                console.log('Authorization header nije pronađen ili nije u ispravnom formatu.');
            } 
            const userId = req.query.id;
            const blocked = true;

            const updateData = { isBlocked: true };
            const userForBlocking = await UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

            await axios.post('http://localhost:5001/auth/updateUserStatus', {userId: userId, blocked: blocked}, 
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            
            return res.status(201).json(userForBlocking);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({message: "Error with blocking this user! Try again.", error: error});
        }
    },

    unblockUser: async(req, res) => {
        try {
            console.log(req.body);
            const userId = req.query.id;
            const authorizationHeader = req.body.headers.Authorization;
            let token = '';

            // Proveri da li postoji `Authorization` header i izvuci token
            if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
                token = authorizationHeader.split(' ')[1];
                console.log(token);
            } else {
                console.log('Authorization header nije pronađen ili nije u ispravnom formatu.');
            } 
            const blocked = false;

            const updateData = { isBlocked: false };
            const userForBlocking = await UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
            
            await axios.post('http://localhost:5001/auth/updateUserStatus', {userId: userId, blocked: blocked}, 
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            return res.status(201).json(userForBlocking);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({message: "Error with unblocking this user! Try again.", error: error});
        }
    },

    
};

export default UsersService;