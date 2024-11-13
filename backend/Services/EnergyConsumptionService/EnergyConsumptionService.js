import mongoose from "mongoose";
import ConsumptionDataModel from '../../models/ConsumptionData.js';

const EnergyConsumptionService = {
    getCurrentConsumption: async (req, res) => {

        try{
            const now = new Date();
            const currentHour = now.getHours();

            const consumptionData = await ConsumptionDataModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $eq: [{ $hour: "$timestamp" }, currentHour]
                        }
                    }
                }
            ]);

            const currentConsumption = consumptionData[0].dailyValue * consumptionData[0].currentConsumption;

            return res.status(200).json(currentConsumption);
        }
        catch(error) {
            console.log("Could not get current consumption.", error);
            return res.status(500).json({message: "Error with getting current consumption value."})
        }
    },

    findConsumptionDataByHourRange: async (req, res) => {
        try {
            console.log(req.query);
            const hour = req.query.hour;
            
            const consumptionData = await ConsumptionDataModel.aggregate([
                {
                    $addFields: {
                        hour: { $hour: "$timestamp" }
                    }
                },
                {
                    $match: {
                        hour: hour
                    }
                }
            ]);

            const currentConsumption = consumptionData[0].dailyValue * consumptionData[0].currentConsumption;
            return res.status(200).json(currentConsumption);
        }
        catch(error) {
            console.log("Could not find consumption for this hour.", error);
            return res.status(500).json({message: "Error with getting current consumption value."})
        }
    }
    
};

export default EnergyConsumptionService;