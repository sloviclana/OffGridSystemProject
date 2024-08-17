import BatteryModel from '../models/Battery.js';
import PanelModel from '../models/Panel.js';
import UserModel from '../models/User.js';
import mongoose from 'mongoose';

const panelsBatteriesController = {
    getAllPanelsFromUser: async (req, res) => {
        try {
            console.log(req.query);

            const id = req.query.id;


            // Dobavljanje vetrogeneratora za datog korisnika
            const panels = await PanelModel.find({ owner: id });

            res.status(200).json(panels);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred while fetching panels." });
        }
    }, 

    getAllBatteriesFromUser: async (req, res) =>  {
            try {
                console.log(req.query);

                const id = req.query.id;
    
    
                // Dobavljanje vetrogeneratora za datog korisnika
                const batteries = await BatteryModel.find({ owner: id });
    
                res.status(200).json(batteries);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "An error occurred while fetching batteries." });
            }
    },

    deletePanelBatterySystem: async(req, res) => {
        try {
            console.log(req.body);
            const systemId = req.query.systemId;

            await PanelModel.deleteOne({ systemId: systemId });
            await BatteryModel.deleteOne({ systemId: systemId });
            res.status(200).json({message: "Panel system removed successfully!"});
        }
        catch(error) {
            console.error(error);
                return res.status(500).json({ message: "An error occurred while deleting panel system." });
        }
    }
};

export default panelsBatteriesController;