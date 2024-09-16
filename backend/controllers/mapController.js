import BatteryModel from '../models/Battery.js';
import PanelModel from '../models/Panel.js';
import UserModel from '../models/User.js';
import ConsumptionDataModel from '../models/ConsumptionData.js';

const mapController = {

    setPanelOnLocation : async(req, res) => {
        const locationData = req.body;
        try{
            const lat = locationData.locationLat;
            const lng = locationData.locationLng;
            const owner = await UserModel.findOne({ email: locationData.user });
            
            const installedPwr = locationData.installedPower;
            let count = await PanelModel.countDocuments({});
            count = count+1;

            let existingPanel = await PanelModel.findOne({systemId: "PanelSystem"+count});
            console.log('Rezultat findOne upita:', existingPanel);

            while (existingPanel ) {
                count = count+1;
                existingPanel = await PanelModel.findOne({ systemId : "PanelSystem"+count});
            }
            
            if(owner == null) 
                return res.status(400).json({ message: "Owner is not valid!"});

            const newPanel = {
                owner: owner,
                location: {
                    type: 'Point',
                    coordinates: [lat, lng ]
                },
                installedPower: installedPwr,
                currentPower: 0,
                systemId: "PanelSystem" + count
            };

            const newBattery = {
                owner: owner,
                location: {
                    type: 'Point',
                    coordinates: [lat, lng]
                },
                capacity: locationData.capacity,
                power: locationData.power,
                chargeLevel: 100,
                chargingDuration: locationData.chargingDuration,
                dischargeDuration: locationData.dischargingDuration,
                state: 'inaction',
                systemId: "PanelSystem" + count
            }

            const panel = await PanelModel.create(newPanel);
            const battery = await BatteryModel.create(newBattery);
            return res.status(201).json({panel, battery});
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Error with creating new panel! Try again.", error: err });
        }
        
    }
};


export default mapController; 