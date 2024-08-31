import BatteryModel from '../models/Battery.js';
import PanelModel from '../models/Panel.js';
import UserModel from '../models/User.js';
import mongoose from 'mongoose';
import WeatherDataModel from '../models/WeatherData.js';
import axios from 'axios';
import { PanelProductionHistoryDataModel, BatteryProductionHistoryDataModel } from '../models/ProductionHistoryData.js';
import ConsumptionDataModel from '../models/ConsumptionData.js';
import ConstantParametersModel from '../models/ConstantParameters.js';

const API_KEY = 'a9499caca355ee647c55a906ad8340fa';

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
    
                return res.status(200).json(batteries);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "An error occurred while fetching batteries." });
            }
    },

    getConsumptionDataHistory: async(req, res) => {
        try {
            const data = await ConsumptionDataModel.find();

            const result = [];

            for(const item of data) {
                const currentConsumption = item.dailyValue * item.currentConsumption;
                result.push(currentConsumption);
            }

            return res.status(200).json(result);
        } 
        catch(error) 
        {
            console.log(error);
            return res.status(500).json({message: 'Cannot get consumption data history!'});
        }
    },

    /* getPreviousThreeDaysData: (data) => {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
        return data.filter(entry => {
            const timestamp = new Date(entry.timestamp);
            return timestamp >= threeDaysAgo && timestamp <= now;
        });
    }, */

    getPanelProductionDataHistory: async function (req, res) {
        try {
            console.log(req.query);

            const id = req.query.systemId;
            const data = await PanelProductionHistoryDataModel.find({systemId: id});

            const now = new Date();
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

            const getPreviousThreeDaysData = (data) => {
                const now = new Date();
                const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
                return data.filter(entry => {
                    const timestamp = new Date(entry.timestamp);
                    return timestamp >= threeDaysAgo && timestamp <= now;
                });
            };

            const filteredData = getPreviousThreeDaysData(data);

            // Inicijalizuj objekat za svaki dan u poslednja tri dana
            const dayData = {};

            filteredData.forEach(entry => {
                const date = new Date(entry.timestamp);
                const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                const hour = date.getHours();

                if (!dayData[day]) {
                    dayData[day] = new Array(24).fill(0); // 24 sata
                }

                dayData[day][hour] = entry.currentPower; // Pretpostavljamo da je chargeLevel ono što prikazujemo
            });

            const productionData = [];
            const labels = [];
            // Postavi labele za dane
            for (const day in dayData) {
                for (let hour = 0; hour < 24; hour++) {
                    labels.push(`${day} ${hour}:00`);
                    productionData.push(dayData[day][hour]);
                }
            }
            
            const result = {labels, productionData};

            return res.status(200).json(result);
        } 
        catch(error) 
        {
            console.log(error);
            return res.status(500).json({message: 'Cannot get panel production data history!'});
        }
    },

    getBatteryChargeLevelDataHistory: async(req, res) => {
        try {
            console.log(req.query);

            const id = req.query.systemId;
            const data = await BatteryProductionHistoryDataModel.find({systemId: id});

            const now = new Date();
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

            const getPreviousThreeDaysData = (data) => {
                const now = new Date();
                const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
                return data.filter(entry => {
                    const timestamp = new Date(entry.timestamp);
                    return timestamp >= threeDaysAgo && timestamp <= now;
                });
            };

            const filteredData = getPreviousThreeDaysData(data);

            // Inicijalizuj objekat za svaki dan u poslednja tri dana
            const dayData = {};

            filteredData.forEach(entry => {
                const date = new Date(entry.timestamp);
                const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                const hour = date.getHours();

                if (!dayData[day]) {
                    dayData[day] = new Array(24).fill(0); // 24 sata
                }

                dayData[day][hour] = entry.chargeLevel; // Pretpostavljamo da je chargeLevel ono što prikazujemo
            });

            const chargeLevelData = [];
            const labels = [];
            // Postavi labele za dane
            for (const day in dayData) {
                for (let hour = 0; hour < 24; hour++) {
                    labels.push(`${day} ${hour}:00`);
                    chargeLevelData.push(dayData[day][hour]);
                }
            }
            
            const result = {labels, chargeLevelData};

            return res.status(200).json(result);
        } 
        catch(error) 
        {
            console.log(error);
            return res.status(500).json({message: 'Cannot get battery charge level data history!'});
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
    },

    findConsumptionDataByHourRange: async (hour) => {
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

        const currentConsumption = consumptionData.dailyValue * consumptionData.currentConsumption;
        return currentConsumption;
    },

    calculatePowerProductionForPanelSystem: async (panelSystemId, weatherData) => {
        try {
            const lastEntryConstParams = await ConstantParametersModel.findOne().sort({ timestamp: -1 });
            const sunset = new Date(weatherData.sys.sunset * 1000);
            const sunrise = new Date(weatherData.sys.sunrise * 1000);
            let isNight = false;

            const sunsetTime = sunset.getHours() * 3600 + sunset.getMinutes() * 60 + sunset.getSeconds();
            const sunriseTime = sunrise.getHours() * 3600 + sunrise.getMinutes() * 60 + sunrise.getSeconds();
            const nowTime = new Date();
            const currentTime = nowTime.getHours() * 3600 + nowTime.getMinutes() * 60 + nowTime.getSeconds();
            
            isNight = currentTime >= sunsetTime || currentTime <= sunriseTime;

            let Ptrenutno = 0;
            const panel = await PanelModel.findOne({systemId: panelSystemId});
            const battery = await BatteryModel.findOne({systemId: panelSystemId});

            if(isNight) {
                Ptrenutno = 0;
                const panelUpdateData = { currentPower: Ptrenutno };
                const panelNewCurrentPower = await PanelModel.findByIdAndUpdate(panel._id, { $set: panelUpdateData }, { new: true });
            } else {
                const Tcelija = weatherData.main.temp + lastEntryConstParams.k * (1 - weatherData.clouds.all/100);
                const fTcelija = 1 - lastEntryConstParams.B * (Tcelija - lastEntryConstParams.Tref);
                Ptrenutno = panel.installedPower * lastEntryConstParams.n * (1 - weatherData.clouds.all/100) * fTcelija;
                
            }
            
            await PanelProductionHistoryDataModel.create({
                panelId: panel._id,
                currentPower: Ptrenutno,
                systemId: panelSystemId,
                owner: panel.owner
            });

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

            let batteryState = '';
            let newChargeLevel = 0.0;

            if(currentConsumption < Ptrenutno) {
                const powerSuficit = Ptrenutno - currentConsumption;
                let updateData = {};
                let batteryChargedPerHour = battery.power*1; //vreme punjenja 1h

                if(powerSuficit < batteryChargedPerHour)
                    batteryChargedPerHour = powerSuficit;

                if(battery.chargeLevel === battery.capacity) {
                    batteryState='inaction';
                    newChargeLevel = battery.capacity;
                    updateData = { state: batteryState, chargeLevel: newChargeLevel };
                }
                else if (battery.chargeLevel + batteryChargedPerHour >= battery.capacity) 
                {
                    newChargeLevel = battery.capacity;
                    batteryState = 'charging';
                    updateData = { state: batteryState, chargeLevel: newChargeLevel };
                    const suficit = battery.capacity - battery.chargeLevel;
                    Ptrenutno = Ptrenutno - suficit;
                }
                else 
                {
                    batteryState = 'charging';
                    newChargeLevel = battery.chargeLevel + batteryChargedPerHour;
                    updateData = { state: batteryState, chargeLevel: newChargeLevel };
                    Ptrenutno = Ptrenutno - batteryChargedPerHour;
                }
                const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });
                
            } 
            else if (currentConsumption > Ptrenutno) 
            {
                const powerDeficit = currentConsumption - Ptrenutno;
                
                batteryState = 'discharging';
                let batteryDischargedPerHour = battery.power*1;
                if(powerDeficit < batteryDischargedPerHour)
                    batteryDischargedPerHour = powerDeficit;

                newChargeLevel = battery.chargeLevel - batteryDischargedPerHour;

                if(battery.chargeLevel === 0) 
                    batteryState = 'inaction'; 

                if(newChargeLevel < 0) {
                    newChargeLevel = 0;
                }
                
                const updateData = { state: batteryState, chargeLevel: newChargeLevel };
                const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });
            }
            else {
                const updateData = { state: 'inaction' };
                batteryState = 'inaction';
                const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });
            }

            const panelUpdateData = { currentPower: Ptrenutno };
            const panelNewCurrentPower = await PanelModel.findByIdAndUpdate(panel._id, { $set: panelUpdateData }, { new: true });

            await BatteryProductionHistoryDataModel.create({
                batteryId: battery._id,
                state: batteryState,
                owner: battery.owner,
                systemId: battery.systemId,
                chargeLevel: newChargeLevel
            });
            
            console.log('Date: ' + nowTime + ', current producted power for panel system ' + panelSystemId + ' is: ' + Ptrenutno);
            return Ptrenutno;

        }
        catch(error) {
            console.log(error);
        }
    },

    updateWeatherDataForAllSystems: async function () {
        try {
            const panels = await PanelModel.find();
            const batteries = await BatteryModel.find();

            for(const panel of panels) {
                const coordinates  = panel.location.coordinates;
                const [lat, lng] = coordinates; 

                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                lat: lat,
                lon: lng,
                appid: API_KEY,
                units: 'metric' // Da se dobiju podaci u metričkim jedinicama
                }
                });

                const weatherData = response.data;

                await WeatherDataModel.create(
                {
                    location: weatherData.name,
                    latitude: lat,
                    longitude: lng, 
                    temperature: weatherData.main.temp, 
                    cloudiness: weatherData.clouds.all,  
                    sunrise: new Date(weatherData.sys.sunrise * 1000),
                    sunset: new Date(weatherData.sys.sunset * 1000),         
                    rain: weatherData.rain ? weatherData.rain['1h'] : 0,
                    systemId: panel.systemId
                });

                await this.calculatePowerProductionForPanelSystem(panel.systemId, weatherData);
            }


        }
        catch(error) {
            console.log(error);
        }
    }
};

export default panelsBatteriesController;