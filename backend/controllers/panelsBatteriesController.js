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

    getPanelProductionDataHistory: async function (req, res) {
        try {
            console.log(req.query);

            const id = req.query.systemId;
            const data = await PanelProductionHistoryDataModel.find({systemId: id});

            const now = new Date();
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

            const getPreviousThreeDaysData = (data) => {
                const now = new Date();  
                const nowUTC = new Date(now.toISOString()); 
                const threeDaysAgoUTC = new Date(nowUTC.getTime() - 3 * 24 * 60 * 60 * 1000); 
            
                // Filtriraj samo zapise u opsegu poslednja tri dana
                return data.filter(entry => {
                    const timestampUTC = new Date(entry.timestamp);  
                    return timestampUTC >= threeDaysAgoUTC && timestampUTC <= nowUTC;
                });
            };
            
            const filteredData = getPreviousThreeDaysData(data);
            
            // Inicijalizuj prazan objekat za svaki dan u poslednja tri dana
            const dayData = {};
            
            // Prođi kroz filtrirane podatke i grupiši ih po danima i satima
            filteredData.forEach(entry => {
                const date = new Date(entry.timestamp);
                date.setUTCHours(date.getUTCHours() + 2);
                const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                const hour = date.getUTCHours() ; // Uzmemo sat u UTC vremenu
            
                if (!dayData[day]) {
                    dayData[day] = {}; // Umesto niza sa 24 sata, koristi objekat
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
                const now = new Date();  // Trenutno vreme u lokalnoj vremenskoj zoni
                const nowUTC = new Date(now.toISOString()); // Trenutno vreme u UTC
                const threeDaysAgoUTC = new Date(nowUTC.getTime() - 3 * 24 * 60 * 60 * 1000);  // Pre tri dana u UTC
            
                // Filtriraj samo zapise u opsegu poslednja tri dana, koristeći UTC za timestamp-ove
                return data.filter(entry => {
                    const timestampUTC = new Date(entry.timestamp);  // Pretvaranje entry.timestamp u UTC
                    return timestampUTC >= threeDaysAgoUTC && timestampUTC <= nowUTC;
                });
            };
            
            const filteredData = getPreviousThreeDaysData(data);
            
            // Inicijalizuj prazan objekat za svaki dan u poslednja tri dana
            const dayData = {};
            
            // Prođi kroz filtrirane podatke i grupiši ih po danima i satima
            filteredData.forEach(entry => {
                const date = new Date(entry.timestamp);
                date.setUTCHours(date.getUTCHours() + 2);
                const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                const hour = date.getUTCHours(); // Uzmemo sat u UTC vremenu
            
                if (!dayData[day]) {
                    dayData[day] = {}; // Umesto niza sa 24 sata, koristi objekat
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

    checkIfItsNight: async function(sunset, sunrise) {
        try {
            let isNight = false;

            const sunsetTime = sunset.getHours() * 3600 + sunset.getMinutes() * 60 + sunset.getSeconds();
            const sunriseTime = sunrise.getHours() * 3600 + sunrise.getMinutes() * 60 + sunrise.getSeconds();
            const nowTime = new Date();
            const currentTime = nowTime.getHours() * 3600 + nowTime.getMinutes() * 60 + nowTime.getSeconds();
            
            isNight = currentTime >= sunsetTime || currentTime <= sunriseTime;

            return isNight;
        }
        catch(error) {
            console.log(error, "Cannot check if its night!");
        }
    },

    calculateCurrentPower: async function (panel, weatherData) {
        try{
            const lastEntryConstParams = await ConstantParametersModel.findOne().sort({ timestamp: -1 });
            let Ptrenutno = 0;
            const sunset = new Date(weatherData.sys.sunset * 1000);
            const sunrise = new Date(weatherData.sys.sunrise * 1000);
            let isNight = await this.checkIfItsNight(sunset, sunrise);

            if(isNight) {
                Ptrenutno = 0;
                const panelUpdateData = { currentPower: Ptrenutno };
                const panelNewCurrentPower = await PanelModel.findByIdAndUpdate(panel._id, { $set: panelUpdateData }, { new: true });
            } else {
                const Tcelija = weatherData.main.temp + lastEntryConstParams.k * (1 - weatherData.clouds.all/100);
                const fTcelija = 1 - lastEntryConstParams.B * (Tcelija - lastEntryConstParams.Tref);
                Ptrenutno = panel.installedPower * lastEntryConstParams.n/100 * (1 - weatherData.clouds.all/100) * fTcelija;
            }
            
            await PanelProductionHistoryDataModel.create({
                panelId: panel._id,
                currentPower: Ptrenutno,
                systemId: panel.systemId,
                owner: panel.owner
            });

            return Ptrenutno;
        }
        catch(error) {
            console.log("Could not calculate current power.", error);
        }
    },

    getCurrentConsumption: async function() {

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

            return currentConsumption;
        }
        catch(error) {
            console.log("Could not get current consumption.", error);
        }
    },

    handlePowerSuficit: async function(powerSuficit, battery, Ptrenutno) {
        let batteryChargedPerHour = battery.power*1;
        let updateData = {};
        let batteryState = '';
        let newChargeLevel = 0.0;

        if(powerSuficit < batteryChargedPerHour)
            batteryChargedPerHour = powerSuficit;

        if(battery.chargeLevel === battery.capacity) {
            batteryState='inaction';
            newChargeLevel = battery.capacity;
            updateData = { state: batteryState, chargeLevel: newChargeLevel, Pcurrent: Ptrenutno };
        }
        else if (battery.chargeLevel + batteryChargedPerHour >= battery.capacity) 
        {
            newChargeLevel = battery.capacity;
            batteryState = 'charging';
            const suficit = battery.capacity - battery.chargeLevel;
            Ptrenutno = Ptrenutno - suficit;
            updateData = { state: batteryState, chargeLevel: newChargeLevel, Pcurrent: Ptrenutno  };
        }
        else 
        {
            batteryState = 'charging';
            newChargeLevel = battery.chargeLevel + batteryChargedPerHour;
            Ptrenutno = Ptrenutno - batteryChargedPerHour;
            updateData = { state: batteryState, chargeLevel: newChargeLevel, Pcurrent: Ptrenutno };
        }

        return updateData;
    },

    calculatePowerProductionForPanelSystem: async function (panelSystemId, weatherData) {
        try {
            const panel = await PanelModel.findOne({systemId: panelSystemId});
            const battery = await BatteryModel.findOne({systemId: panelSystemId});
            let Pcurrent = await this.calculateCurrentPower(panel, weatherData);
            const currentConsumption = await this.getCurrentConsumption();
            let batteryState = '';
            let newChargeLevel = 0.0;

            if(currentConsumption < Pcurrent) {
                const powerSuficit = Pcurrent - currentConsumption;
                const updateDataFull = await this.handlePowerSuficit(powerSuficit, battery, Pcurrent);
                Pcurrent = updateDataFull.Pcurrent;
                batteryState = updateDataFull.state;
                newChargeLevel = updateDataFull.chargeLevel;
                const updateData = {state: updateDataFull.state, chargeLevel: updateDataFull.chargeLevel}
                const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });
            } 
            else if (currentConsumption > Pcurrent) 
            {
                const powerDeficit = currentConsumption - Pcurrent;
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

            const panelUpdateData = { currentPower: Pcurrent };
            const panelNewCurrentPower = await PanelModel.findByIdAndUpdate(panel._id, { $set: panelUpdateData }, { new: true });

            await BatteryProductionHistoryDataModel.create({
                batteryId: battery._id,
                state: batteryState,
                owner: battery.owner,
                systemId: battery.systemId,
                chargeLevel: newChargeLevel
            });
            
            const time = new Date();
            console.log('Date: ' + time + ', current producted power for panel system ' + panelSystemId + ' is: ' + Pcurrent);
            return Pcurrent;

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