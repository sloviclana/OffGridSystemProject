import mongoose from "mongoose";
import ConstantParametersModel from "../../models/ConstantParameters.js";
import axios from "axios";

const ConstantParametersService = {
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

export default ConstantParametersService;