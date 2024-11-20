import mongoose from "mongoose";
import HistoryDataModel from '../../models/HistoryData.js';
import WeatherDataModel from "../../models/WeatherData.js";
import axios from 'axios';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const API_KEY = 'a9499caca355ee647c55a906ad8340fa';

const HistoryDataService = {
    updateWeatherDataForAllSystems: async function () {
        try {
            const panels = await axios.get('http://localhost:5004/panels/getAllPanels');
            const batteries = await axios.get('http://localhost:5005/batteries/getAllBatteries');

            for(const panel of panels.data) {
                const coordinates  = panel.location.coordinates;
                const [lat, lng] = coordinates; 
                let panelSystemId = panel.systemId;

                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                lat: lat,
                lon: lng,
                appid: API_KEY,
                units: 'metric' // Da se dobiju podaci u metričkim jedinicama
                }
                });

                const weatherData = response.data;

                const weatherRecord = await WeatherDataModel.create(
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

                let result = await axios.post('http://localhost:5004/panels/calculatePowerProductionForPanelSystem', {
                    params: {
                        panelSystemId,
                        weatherData
                    }
                });

                console.log('Pcurrent: ' + result.data);
            }


        }
        catch(error) {
            console.log(error);
        }
    },

    getAllWeatherData: async(req, res) => {
        try{
            const result = await WeatherDataModel.find()
            .sort({ timestamp: 1 })  // Sortiraj po 'timestamp' uzlazno (od najstarijeg do najnovijeg)
            .exec();

            return res.status(200).json(result);
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({message: "An error occured while getting all the weather data!"});
        }
    }, 

    getAllWeatherDataOfPanel: async(req, res) => {
        try{
            console.log(req.query);

            const systemId = req.query.systemId;

            const result = await WeatherDataModel.find({ systemId: panel.systemId })  
                        .sort({ timestamp: 1 })  
                        .exec();  

            return res.status(200).json(result);
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({message: "An error occured while getting all the weather data of panel with system id: " + systemId +"!"});
        }
    },

    generateHistoryDataReport: async function(req, res) {
        try {
            const timestamp1 = new Date(req.body.params.timestamp1);
            const timestamp2 = new Date(req.body.params.timestamp2);
            const systemid = req.body.params.systemId;

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
            const excelFilePath = 'C:/Users/pc/Documents/softvEksploatacija/projekat/OffGridSystemProject/backend/reports/' + systemid + 'report.xlsx';

            let counter = 1;
            let newFilePath = excelFilePath;

            // Proverite da li fajl postoji
            while (fs.existsSync(newFilePath)) {
                // Ako postoji, dodajte brojač na kraju imena fajla
                const extname = path.extname(excelFilePath);
                const basename = path.basename(excelFilePath, extname);
                newFilePath = path.join(path.dirname(excelFilePath), `${basename}_${counter}${extname}`);
                counter++;
            }

            // Sačuvaj radnu knjigu u Excel fajl na jedinstvenoj putanji
            xlsx.writeFile(workbook, newFilePath);
        
            console.log('XLSX fajl je uspešno sačuvan.');
            return res.status(200).json("Your report is generated successfully in folder '/reports' on filepath: " + newFilePath);
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({ message: "Could not generate history report for: " + systemid});
        }
    },

    getPanelProductionDataHistory: async function (req, res) {
        try {
            console.log(req.query);

            const id = req.query.systemId;
            const days = parseInt(req.query.days, 10);

            if (isNaN(days) || days <= 0) {
                return res.status(400).json({ message: 'Invalid number of days!' });
            }

            const data = await HistoryDataModel.find({systemId: id});

            const now = new Date();
            const nowUTC = new Date(now.toISOString()); 
            const daysAgoUTC = new Date(nowUTC.getTime() - days * 24 * 60 * 60 * 1000); 
            const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const threeDaysLater = new Date(daysAgoUTC.getTime() + 3 * 24 * 60 * 60 * 1000);
            
            const filteredData = data.filter(entry => entry.timestamp >= daysAgoUTC && entry.timestamp <= threeDaysLater);
            
            const dayData = {};
            
            // group by date and time
            filteredData.forEach(entry => {
                const date = entry.timestamp;
                const dateStr = date.toString();
                const cleanDateStrDay = dateStr.split('G')[0].trim();
                const cleanDateStrFull = cleanDateStrDay.slice(4);
                const cleanDateStr = cleanDateStrFull.slice(0, -3);
            
                if (!dayData[cleanDateStr]) {
                    dayData[cleanDateStr] = {}; 
                }

                dayData[cleanDateStr] = {
                    panelCurrentPower: entry.panelCurrentPower,
                    batteryChargeLevel: entry.batteryChargeLevel,
                    currentConsumption: entry.currentConsumption
                };
            });

            const productionData = [];
            const batteryChargeLevelData = [];
            const consumptionData = [];
            const labels = [];

            for (const cleanDateStr in dayData) {
                labels.push(`${cleanDateStr}`);
                productionData.push(dayData[cleanDateStr].panelCurrentPower);
                batteryChargeLevelData.push(dayData[cleanDateStr].batteryChargeLevel);
                consumptionData.push(dayData[cleanDateStr].currentConsumption);
            }
            
            const result = {
                labels,
                productionData,      
                batteryChargeLevelData,        
                consumptionData    
            };

            return res.status(200).json(result);
        } 
        catch(error) 
        {
            console.log(error);
            return res.status(500).json({message: 'Cannot get panel production data history!'});
        }
    },

    updateHistoryDataForAllPanelSystems: async function () {
        const weatherData = await axios.get('http://localhost:5009/weather/getAllWeatherData');
        // .sort({ timestamp: 1 })  // Sortiraj po 'timestamp' uzlazno (od najstarijeg do najnovijeg)
        // .exec();  

        const panels = await axios.get('http://localhost:5004/panels/getAllPanels');

        for (const panel of panels) {

            const weatherDatasOfPanel = await axios.get('http://localhost:5009/weather/getAllWeatherData', { systemId: panel.systemId });
            
            let installedPower = panel.installedPower;
            let systemId = panel.systemId;
            let owner = panel.owner;
            let currentCellsTemperature = 0;
            let currentFofCellsTeperature = 0;
            let currentPanelPower = 0;

            for (const weatherData of weatherDatasOfPanel) {
                let battery = await axios.get('http://localhost:5005/batteries/getBatteryBySystemId', {systemId: panel.systemId});
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

                let currentConsumption = await axios.get('http://localhost:5006/energyConsumption/findConsumptionDataByHourRange', {hour: currentHour});
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
                    const batteryNewState = await axios.post('http://localhost:5005/batteries/updateBatteryById', {batteryId: battery._id, updateData: updateData});

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
                        currentConsumption = currentPanelPower;
                    }
                    else {
                        newChargeLevel = currentChargeLevel - batteryChargeLevelReduction;
                        currentConsumption = batteryChargeLevelReduction;
                        newBatteryState = 'discharging';
                    }

                    if(newChargeLevel < 0) {
                        newChargeLevel = 0;
                        currentConsumption = currentChargeLevel;
                    }

                    const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                    const batteryNewState = await axios.post('http://localhost:5005/batteries/updateBatteryById', {batteryId: battery._id, updateData: updateData});
                } 
                else {
                    newChargeLevel = currentChargeLevel;
                    newBatteryState = 'inaction';

                    const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                    const batteryNewState = await axios.post('http://localhost:5005/batteries/updateBatteryById', {batteryId: battery._id, updateData: updateData});
                }

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
                    currentConsumption: currentConsumption,
                    locationName: locationName
                });
            }
            
            
        }

    },

    findNameOfLocation: async(req, res) => {
        try {
            console.log(req.body.params);
            const panelSystemId = req.body.params.systemId;

            const recordOnTheLocation = await HistoryDataModel.findOne({systemId: panelSystemId});
            const locationName = recordOnTheLocation.locationName;

            return res.status(200).json(locationName);
        }
        catch (error){
            console.error(error);
            return res.status(500).json({message: "Could not find name of location for panel system: " + panelSystemId});
        }
    },

    createNewHistoryDataRecord: async(req, res) => {
        try {
            console.log(req.body.params);

            const newHistoryDataRecord = req.body.params.historyDataRecord;
            const historyRecord = await HistoryDataModel.create(newHistoryDataRecord);

            return res.status(200).json(historyRecord);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({message: "An error occured with creating HistoryData record."});
        }
    },

    getForecast: async (req, res) => {
        try {

            const systemId = req.body.params.systemId;

            const panelInfo = await WeatherDataModel.findOne({systemId: systemId});
            const LAT = panelInfo.latitude;
            const LON = panelInfo.longitude;

            const dataForPrediction = await HistoryDataModel.find(
                {systemId: systemId},
                { // Projekcija - samo željena polja
                    timestamp: 1,
                    currentOutsideTemperature: 1,
                    currentCloudinessPercent: 1,
                    sunset: 1,
                    sunrise: 1,
                    rain: 1, 
                    panelCurrentPower: 1,    
                    _id: 0 // Isključuje polje _id iz rezultata
                }
            );

            const fields = ['timestamp', 'currentOutsideTemperature', 'currentCloudinessPercent', 
                'sunset', 'sunrise', 'rain', 'panelCurrentPower'];

            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day} ${hours}:${minutes}`;
            };

             // Pripremi podatke za radni list
            const filteredDataForExcel = dataForPrediction.map(entry => {
                const result = {};
                fields.forEach(field => {
                    result[field] = field === 'timestamp' ? formatDate(new Date(entry[field])) : entry[field];
                });
                return result;
            });

            const csvData = Papa.unparse(filteredDataForExcel);

            // Sačuvaj radnu knjigu u Excel fajl
            const filePath = 'C:/Users/pc/Documents/softvEksploatacija/projekat/OffGridSystemProject/backend/Services/ForecastPredictionService/dataForPrediction.csv';

            // Sačuvaj CSV string u fajl
            fs.writeFileSync(filePath, csvData);
            console.log("CSV fajl je uspešno sačuvan na putanji:", filePath);

            const response = await axios.post('http://localhost:5009/predict', { LAT, LON });


            return res.status(200).json(response.data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: "An error occured with predicting energy production for panel system: ."});
        }
    }
};

export default HistoryDataService;