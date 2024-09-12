import BatteryModel from '../models/Battery.js';
import PanelModel from '../models/Panel.js';
import UserModel from '../models/User.js';
import mongoose from 'mongoose';
import WeatherDataModel from '../models/WeatherData.js';
import axios from 'axios';
import { PanelProductionHistoryDataModel, BatteryProductionHistoryDataModel } from '../models/ProductionHistoryData.js';
import ConsumptionDataModel from '../models/ConsumptionData.js';
import ConstantParametersModel from '../models/ConstantParameters.js';
import HistoryDataModel from '../models/HistoryData.js';
import { parse } from 'json2csv';
import fs from 'fs';
import xlsx from 'xlsx';

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

    generateHistoryDataReport: async function(timestamp1, timestamp2, systemid) {
        try {
            const data = await HistoryDataModel.find({systemId: systemid});

            const filteredData = data.filter(entry => entry.timestamp >= timestamp1 && entry.timestamp <= timestamp2);

            const fields = ['timestamp', 'currentOutsideTemperature', 'currentCloudinessPercent', 'currentCellsTemperature', 
                'currentFunctionOfCellsTemperature', 'panelCurrentPower', 'batteryChargeLevel'];

            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}`;
            };

             // Pripremi podatke za radni list
            const filteredDataForExcel = filteredData.map(entry => {
                const result = {};
                fields.forEach(field => {
                    result[field] = field === 'timestamp' ? formatDate(new Date(entry[field])) : entry[field];
                });
                return result;
            });

            // Pretvori JSON podatke u radni list
            const worksheet = xlsx.utils.json_to_sheet(filteredDataForExcel);

            // Kreiraj radnu knjigu i dodaj radni list
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

            // Sačuvaj radnu knjigu u Excel fajl
            const excelFilePath = 'C:/Users/pc/Documents/softvEksploatacija/projekat/OffGridSystemProject/backend/report.xlsx';

            xlsx.writeFile(workbook, excelFilePath);
        
            console.log('XLSX fajl je uspešno sačuvan.');
        }
        catch(error) {
            console.error(error);
            //return res.status(500).json({ message: "Could not generate history report for: " + systemid});
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
    
    getPreviousDaysData: async function (data) {
        const now = new Date();  // Trenutno vreme u lokalnoj vremenskoj zoni
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);  // Pre tri dana
    
        // Filtriraj samo zapise u opsegu poslednja tri dana
        data.filter(entry => entry.timestamp >= threeDaysAgo && entry.timestamp <= now);

        return data;
    },

    getPanelProductionDataHistory: async function (req, res) {
        try {
            console.log(req.query);

            const id = req.query.systemId;
            const days = parseInt(req.query.days, 10); // Parsiranje u integer sa bazom 10

            // Provera da li je broj validan
            if (isNaN(days) || days <= 0) {
                return res.status(400).json({ message: 'Invalid number of days!' });
            }

            const data = await HistoryDataModel.find({systemId: id});

            const now = new Date();
            const nowUTC = new Date(now.toISOString()); 
            const daysAgoUTC = new Date(nowUTC.getTime() - days * 24 * 60 * 60 * 1000); 
            const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const threeDaysLater = new Date(daysAgoUTC.getTime() + 3 * 24 * 60 * 60 * 1000);
            
            // Filtriraj samo zapise u opsegu poslednja tri dana
            const filteredData = data.filter(entry => entry.timestamp >= daysAgoUTC && entry.timestamp <= threeDaysLater);
            
            // Inicijalizuj prazan objekat za svaki dan u poslednja tri dana
            const dayData = {};
            
            // Prođi kroz filtrirane podatke i grupiši ih po danima i satima
            filteredData.forEach(entry => {
                const date = entry.timestamp;
                const dateStr = date.toString();
                const cleanDateStrDay = dateStr.split('G')[0].trim();
                const cleanDateStrFull = cleanDateStrDay.slice(4);
                const cleanDateStr = cleanDateStrFull.slice(0, -3);
            
                if (!dayData[cleanDateStr]) {
                    dayData[cleanDateStr] = {}; // Umesto niza sa 24 sata, koristi objekat
                }

                dayData[cleanDateStr] = entry.panelCurrentPower;
            });

            const productionData = [];
            const labels = [];
           
            for (const cleanDateStr in dayData) {
                labels.push(`${cleanDateStr}`);
                productionData.push(dayData[cleanDateStr]);
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
            const days = parseInt(req.query.days, 10); // Parsiranje u integer sa bazom 10

            // Provera da li je broj validan
            if (isNaN(days) || days <= 0) {
                return res.status(400).json({ message: 'Invalid number of days!' });
            }

            const data = await HistoryDataModel.find({systemId: id});

            const now = new Date();  
            const nowUTC = new Date(now.toISOString()); 
            const daysAgoUTC = new Date(nowUTC.getTime() - days * 24 * 60 * 60 * 1000); 
            const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const threeDaysLater = new Date(daysAgoUTC.getTime() + 3 * 24 * 60 * 60 * 1000);
            
            // Filtriraj samo zapise u opsegu poslednja tri dana
            const filteredData = data.filter(entry => entry.timestamp >= daysAgoUTC && entry.timestamp <= threeDaysLater);
            
            // Inicijalizuj prazan objekat za svaki dan u poslednja tri dana
            const dayData = {};
            
            // Prođi kroz filtrirane podatke i grupiši ih po danima i satima
            filteredData.forEach(entry => {
                const date = entry.timestamp;
                const dateStr = date.toString();
                const cleanDateStrDay = dateStr.split('G')[0].trim();
                const cleanDateStrFull = cleanDateStrDay.slice(4);
                const cleanDateStr = cleanDateStrFull.slice(0, -3);
            
                if (!dayData[cleanDateStr]) {
                    dayData[cleanDateStr] = {}; // Umesto niza sa 24 sata, koristi objekat
                }

                dayData[cleanDateStr] = entry.batteryChargeLevel;
            });

            const chargeLevelData = [];
            const labels = [];
            // Postavi labele za dane
            for (const cleanDateStr in dayData) {
                labels.push(`${cleanDateStr}`);
                chargeLevelData.push(dayData[cleanDateStr]);
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

        const currentConsumption = consumptionData[0].dailyValue * consumptionData[0].currentConsumption;
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

    checkIfItsNightOfTimestamp: async function(sunset, sunrise, timestamp) {
        try {
            let isNight = false;

            const sunsetTime = sunset.getHours() * 3600 + sunset.getMinutes() * 60 + sunset.getSeconds();
            const sunriseTime = sunrise.getHours() * 3600 + sunrise.getMinutes() * 60 + sunrise.getSeconds();
            const nowTime = new Date(timestamp);
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
                const Tcelija = await this.calculateCellsTemperature(weatherData.main.temp, weatherData.clouds.all);
                const fTcelija = await this.calculateFunctionOfCellsTemperature(Tcelija);
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

    calculatePowerProductionForPanelSystem: async function (panelSystemId, weatherData) {
        try {
            const panel = await PanelModel.findOne({systemId: panelSystemId});
            const battery = await BatteryModel.findOne({systemId: panelSystemId});
            let Pcurrent = await this.calculateCurrentPower(panel, weatherData);
            const Tcelija = await this.calculateCellsTemperature(weatherData.main.temp, weatherData.clouds.all);
            const fTcelija = await this.calculateFunctionOfCellsTemperature(Tcelija);
            const currentConsumption = await this.getCurrentConsumption();
            let newChargeLevel = 0.0;
            let newBatteryState = '';
            let batteryChargedPerHour = battery.power * 1;
            let batteryCapacity = battery.capacity;

            if(currentConsumption < Pcurrent) {
                const powerSuficit = Pcurrent - currentConsumption;
                let batteryChargeLevelAddition = batteryChargedPerHour;

                if(powerSuficit < batteryChargedPerHour){
                    batteryChargeLevelAddition = powerSuficit; 
                }
                
                if(battery.chargeLevel === batteryCapacity) {
                    newBatteryState = 'inaction';
                    newChargeLevel = batteryCapacity;
                } 
                else {
                    newChargeLevel = battery.chargeLevel + batteryChargeLevelAddition;
                    newBatteryState = 'charging';
                }

                if(newChargeLevel > batteryCapacity) {
                    newChargeLevel = batteryCapacity;
                }

                const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });
            } 
            else if(Pcurrent < currentConsumption) {
                const powerDeficit = currentConsumption - Pcurrent;
                let batteryChargeLevelReduction = batteryChargedPerHour;

                if(powerDeficit < batteryChargeLevelReduction) {
                    batteryChargeLevelReduction = powerDeficit;
                }

                if(battery.chargeLevel === 0) {
                    newChargeLevel = 0;
                    newBatteryState = 'inaction';
                }
                else {
                    newChargeLevel = battery.chargeLevel - batteryChargeLevelReduction;
                    newBatteryState = 'discharging';
                }

                if(newChargeLevel < 0) {
                    newChargeLevel = 0;
                }

                const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });
                } 
                else {
                    newChargeLevel = battery.chargeLevel;
                    newBatteryState = 'inaction';

                    const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                    const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });
                }

            const panelUpdateData = { currentPower: Pcurrent };
            const panelNewCurrentPower = await PanelModel.findByIdAndUpdate(panel._id, { $set: panelUpdateData }, { new: true });

            await BatteryProductionHistoryDataModel.create({
                batteryId: battery._id,
                state: newBatteryState,
                owner: battery.owner,
                systemId: battery.systemId,
                chargeLevel: newChargeLevel
            });

            await PanelProductionHistoryDataModel.create({
                panelId: panel._id,
                currentPower: Pcurrent,
                systemId: panel.systemId,
                owner: panel.owner
            });

            HistoryDataModel.create({
                systemId: panelSystemId,
                owner: panel.owner,
                panelInstalledPower: panel.installedPower,
                batteryPower: battery.power,
                batteryCapacity: battery.capacity,
                batteryChargeLevel: newChargeLevel,
                batteryState: newBatteryState,
                sunset: new Date(weatherData.sys.sunset * 1000),
                sunrise: new Date(weatherData.sys.sunrise * 1000),
                currentOutsideTemperature: weatherData.main.temp,
                currentCloudinessPercent: weatherData.clouds.all,
                currentCellsTemperature: Tcelija,
                currentFunctionOfCellsTemperature: fTcelija,
                panelCurrentPower: Pcurrent,
                locationName: weatherData.name
            });
            
            const time = new Date();
            console.log('Date: ' + time + ', current producted power for panel system ' + panelSystemId + ' is: ' + Pcurrent);
            return Pcurrent;

        }
        catch(error) {
            console.log(error);
        }
    },

    calculateCellsTemperature: async function(temperature, cloudiness) {
        const lastEntryConstParams = await ConstantParametersModel.findOne().sort({ timestamp: -1 });
        const k = lastEntryConstParams.k;

        let Tcells = temperature + (1 - cloudiness/100)*k;
        return Tcells;
    },

    calculateFunctionOfCellsTemperature: async function(cellsTemperature) {
        const lastEntryConstParams = await ConstantParametersModel.findOne().sort({ timestamp: -1 });
        const B = lastEntryConstParams.B;
        const Tref = lastEntryConstParams.Tref;

        let temperatureDifference = cellsTemperature - Tref;
        if(temperatureDifference < 0) {
            temperatureDifference = temperatureDifference * (-1);   //apsolutna vrednost
        }

        let fOfTcells = 1 - B * temperatureDifference;

        return fOfTcells;
    },

    calculateCurrentPanelPower: async function (installedPower, fOfTcells, cloudiness, sunset, sunrise, timestamp) {
        const lastEntryConstParams = await ConstantParametersModel.findOne().sort({ timestamp: -1 });
        const nPercent = lastEntryConstParams.n;

        let currentPower = installedPower * nPercent/100 * (1 - cloudiness/100) * fOfTcells;

        let isNight = await this.checkIfItsNightOfTimestamp(sunset, sunrise, timestamp);

        if(isNight) {
            return 0;
        }

        return currentPower;
    },

    updateHistoryDataForAllPanelSystems: async function () {
        const weatherData = await WeatherDataModel.find({})
        .sort({ timestamp: 1 })  // Sortiraj po 'timestamp' uzlazno (od najstarijeg do najnovijeg)
        .exec();  

        const panels = await PanelModel.find();

        for (const panel of panels) {

            const weatherDatasOfPanel = await WeatherDataModel.find({ systemId: panel.systemId })  // Pronađi podatke za odgovarajući 'systemId'
                .sort({ timestamp: 1 })  // Sortiraj vremenske podatke hronološki
                .exec();  // Izvrši upit
        
            
            let installedPower = panel.installedPower;
            let systemId = panel.systemId;
            let owner = panel.owner;
            let currentCellsTemperature = 0;
            let currentFofCellsTeperature = 0;
            let currentPanelPower = 0;

            for (const weatherData of weatherDatasOfPanel) {
                let battery = await BatteryModel.findOne({systemId: panel.systemId});
                let batteryPower = battery.power;
                let batteryCapacity = battery.capacity;
                let currentChargeLevel = battery.chargeLevel;
                let currentBatteryState = battery.state;
                let batteryChargedPerHour = battery.power * 1;

                let currentOutsideTemperature = weatherData.temperature;
                let locationName = weatherData.location;
                let currentCloudinessPercent = weatherData.cloudiness;
                let sunrise =  new Date(weatherData.sunrise);
                let sunset = new Date(weatherData.sunset);
                let timestamp = weatherData.timestamp;

                currentCellsTemperature = await this.calculateCellsTemperature(currentOutsideTemperature, currentCloudinessPercent);
                currentFofCellsTeperature = await this.calculateFunctionOfCellsTemperature(currentCellsTemperature);
                currentPanelPower = await this.calculateCurrentPanelPower(installedPower, currentFofCellsTeperature, currentCloudinessPercent, sunset, sunrise, timestamp);

                const currentHour = weatherData.timestamp.getHours();

                const currentConsumption = await this.findConsumptionDataByHourRange(currentHour);
                let newBatteryState = '';
                let newChargeLevel = 0;

                if(currentPanelPower > currentConsumption) {
                    const powerSuficit = currentPanelPower - currentConsumption;
                    let batteryChargeLevelAddition = batteryChargedPerHour;

                    if(powerSuficit < batteryChargedPerHour){
                        batteryChargeLevelAddition = powerSuficit; 
                    }
                    
                    if(currentChargeLevel === batteryCapacity) {
                        newBatteryState = 'inaction';
                        newChargeLevel = batteryCapacity;
                    } 
                    else {
                        newChargeLevel = currentChargeLevel + batteryChargeLevelAddition;
                        newBatteryState = 'charging';
                    }

                    if(newChargeLevel > batteryCapacity) {
                        newChargeLevel = batteryCapacity;
                    }

                    const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                    const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });

                } 
                else if( currentPanelPower < currentConsumption) {
                    const powerDeficit = currentConsumption - currentPanelPower;
                    let batteryChargeLevelReduction = batteryChargedPerHour;

                    if(powerDeficit < batteryChargeLevelReduction) {
                        batteryChargeLevelReduction = powerDeficit;
                    }

                    if(currentChargeLevel === 0) {
                        newChargeLevel = 0;
                        newBatteryState = 'inaction';
                    }
                    else {
                        newChargeLevel = currentChargeLevel - batteryChargeLevelReduction;
                        newBatteryState = 'discharging';
                    }

                    if(newChargeLevel < 0) {
                        newChargeLevel = 0;
                    }

                    const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                    const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });
                } 
                else {
                    newChargeLevel = currentChargeLevel;
                    newBatteryState = 'inaction';

                    const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                    const batteryNewState = await BatteryModel.findByIdAndUpdate(battery._id, { $set: updateData }, { new: true });
                }

                await BatteryProductionHistoryDataModel.create({
                    batteryId: battery._id,
                    state: newBatteryState,
                    owner: owner,
                    systemId: systemId,
                    chargeLevel: newChargeLevel,
                    timestamp: timestamp
                });
    
                await PanelProductionHistoryDataModel.create({
                    panelId: panel._id,
                    currentPower: currentPanelPower,
                    systemId: systemId,
                    owner: owner,
                    timestamp: timestamp
                });

                HistoryDataModel.create({
                    systemId: systemId,
                    owner: owner,
                    panelInstalledPower: installedPower,
                    batteryPower: batteryPower,
                    batteryCapacity: batteryCapacity,
                    batteryChargeLevel: newChargeLevel,
                    batteryState: newBatteryState,
                    sunset: sunset,
                    sunrise: sunrise,
                    currentOutsideTemperature: currentOutsideTemperature,
                    currentCloudinessPercent: currentCloudinessPercent,
                    currentCellsTemperature: currentCellsTemperature,
                    currentFunctionOfCellsTemperature: currentFofCellsTeperature,
                    panelCurrentPower: currentPanelPower,
                    timestamp: timestamp,
                    locationName: locationName
                });
            }
            
            
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