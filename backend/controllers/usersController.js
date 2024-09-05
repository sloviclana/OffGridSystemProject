import UserModel from '../models/User.js';
import PanelModel from '../models/Panel.js';
import BatteryModel from '../models/Battery.js';
import ConstantParametersModel from '../models/ConstantParameters.js';

const usersController = {
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
            const userId = req.query.id;

            const updateData = { isBlocked: true };
            const userForBlocking = await UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
            
            return res.status(201).json(userForBlocking);
        }
        catch (error) {
            return res.status(500).json({message: "Error with blocking this user! Try again.", error: error});
        }
    },

    unblockUser: async(req, res) => {
        try {
            console.log(req.body);
            const userId = req.query.id;

            const updateData = { isBlocked: false };
            const userForBlocking = await UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
            
            return res.status(201).json(userForBlocking);
        }
        catch (error) {
            return res.status(500).json({message: "Error with unblocking this user! Try again.", error: error});
        }
    },

    getLastConstParameters: async(req, res) => {

        try{
            console.log(req.body);

            const lastEntry = await ConstantParametersModel.findOne().sort({ timestamp: -1 });

            return res.status(201).json(lastEntry);
        }
        catch(error) {
            return res.status(500).json({message: "Error with getting constant parameters values! Try again.", error: error});
        }
        
    },

    setNewConstParameters: async(req, res) => {

        try {
            console.log(req.body);
            const { n, B, Tref, k, userId } = req.body;

            const newEntry = await ConstantParametersModel.create({n: n, B: B, Tref: Tref, k: k, adminInput: userId});

            console.log(newEntry);
            return res.status(201).json(newEntry);
        }
        catch(error) {
            return res.status(500).json({message: "Error with setting new constant parameters! Try again.", error: error});
        }
    }
};

export default usersController;
