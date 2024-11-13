import BatteryModel from "../../models/Battery.js";
import mongoose from "mongoose";
import axios from 'axios';
import { parse } from 'json2csv';
import fs from 'fs';
import xlsx from 'xlsx';

const BatteriesService = {
    getAllBatteriesFromUser: async (req, res) =>  {
        try {
            console.log(req.query);

            const id = req.query.id;


            // Dobavljanje vetrogeneratora za datog korisnika
            const batteries = await BatteryModel.find({ owner: id });

            return res.status(200).json(batteries);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred while fetching batteries." });
        }
    },

    createBattery: async(req, res) => {
        try {
            console.log(req.query);

            const newBattery = req.body.params.newBattery;

            const newBat = await BatteryModel.create(newBattery);

            return res.status(200).json(newBat);
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({message: "An error occured while creating battery on location: " + newBattery.location});
        }
    },

    getBatteryBySystemId: async(req, res) => {
        try {
            console.log(req.query);

            const systemid = req.query.systemId;

            const battery = await BatteryModel.findOne({systemId: systemid});

            return res.status(200).json(battery);
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred while getting battery with system id: " + systemid});
        }
    },

    deleteBatteryBySystemId: async(req, res) => {
        try {
            console.log(req.query);

            const systemId = req.query.systemId;

            await BatteryModel.deleteOne({ systemId: systemId });
            return res.status(200).json({message: "Battery with system id: " + systemId + " removed successfully!"});
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred while deleting battery of panel system: " + systemId + "." });
        }
    },

    updateBatteryById: async(req, res) => {
        try {
            console.log(req.query);

            const batteryId = req.body.params.batteryId;
            const updateData = req.body.params.updateData;

            const batteryNewState = await BatteryModel.findByIdAndUpdate(batteryId, { $set: updateData }, { new: true });

            return res.status(200).json(batteryNewState);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "An error occurred while updating battery with id: " + batteryId + "." });
        }
    },

    getAllBatteries: async(req, res) => {
        try {
            const batteries = await BatteryModel.find();

            return res.status(200).json(batteries);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: "An error occurred while getting all batteries." });
        }
    }
}

export default BatteriesService;