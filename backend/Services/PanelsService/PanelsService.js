import PanelModel from "../../models/Panel.js";
import PanelPowerCalculator from "./PanelPowerCalculator.js";
import mongoose from "mongoose";
import axios from 'axios';
import { parse } from 'json2csv';
import fs from 'fs';
import xlsx from 'xlsx';

const PanelService = {
    getAllPanelsFromUser: async (req, res) => {
        try {
            console.log(req.query);

            const id = req.query.id;

            // Dobavljanje panela za datog korisnika
            const panels = await PanelModel.find({ owner: id });

            res.status(200).json(panels);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred while fetching panels." });
        }
    }, 

    setPanelOnLocation : async(req, res) => {
        const locationData = req.body;
        try{
            const lat = locationData.locationLat;
            const lng = locationData.locationLng;
            const ownerResponse = await axios.get('http://localhost:5002/users/findUserByEmail', {
                params: { email: locationData.user }
              });
            
            const owner = ownerResponse.data;
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
            const batteryCreation = await axios.post('http://localhost:5005/batteries/createBattery', {
                params: {newBattery: newBattery}
             });

            const battery = batteryCreation.data;
            return res.status(201).json({panel, battery});
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Error with creating new panel! Try again.", error: err });
        }
        
    },

    getAllPanels: async(req, res) => {
        try{
            const panels = await PanelModel.find();

            return res.status(200).json(panels);
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({message: "An error occured while getting all panels!"});
        }
    },

    deletePanelBatterySystem: async(req, res) => {
        try {
            console.log(req.body);
            const systemId = req.query.systemId;

            await PanelModel.deleteOne({ systemId: systemId });
            var res = await axios.post('http://localhost:5005/batteries/deleteBatteryBySystemId', {systemId: systemId});
            
            console.log(res);

            res.status(200).json({message: "Panel system removed successfully!"});
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred while deleting panel system." });
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

    calculatePowerProductionForPanelSystem: async (req, res) => {
        try {
            const panelSystemId = req.body.params.panelSystemId;
            const weatherData = req.body.params.weatherData;
            const panel = await PanelModel.findOne({systemId: panelSystemId});
            const batteryResult = await axios.get('http://localhost:5005/batteries/getBatteryBySystemId', { params: {systemId: panelSystemId}});
            const battery = batteryResult.data;

            const lastEntryConstParamsResult = await axios.get('http://localhost:5003/constParams/getLastConstParameters', { timeout: 10000 });
            const lastEntryConstParams = lastEntryConstParamsResult.data;

            let Pcurrent = await PanelPowerCalculator.calculateCurrentPower(panel, weatherData);
            const Tcelija = await PanelPowerCalculator.calculateCellsTemperature(weatherData.main.temp, weatherData.clouds.all, lastEntryConstParams);
            const fTcelija = await PanelPowerCalculator.calculateFunctionOfCellsTemperature(Tcelija, lastEntryConstParams);

            let currentConsumptionResult = await axios.get('http://localhost:5006/energyConsumption/getCurrentConsumption');
            let currentConsumption = currentConsumptionResult.data;

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
                const batteryNewState = await axios.post('http://localhost:5005/batteries/updateBatteryById', 
                    {
                        params: {
                            batteryId: battery._id, 
                            updateData: updateData
                        }
                    });
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
                    currentConsumption = Pcurrent;
                }
                else {
                    newChargeLevel = battery.chargeLevel - batteryChargeLevelReduction;
                    newBatteryState = 'discharging';
                    currentConsumption = batteryChargeLevelReduction;
                }

                if(newChargeLevel < 0) {
                    newChargeLevel = 0;
                    currentConsumption = battery.chargeLevel;
                }

                const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                const batteryNewState = await axios.post('http://localhost:5005/batteries/updateBatteryById', 
                    {
                        params: {
                            batteryId: battery._id, 
                            updateData: updateData
                        }
                    });
                } 
                else {
                    newChargeLevel = battery.chargeLevel;
                    newBatteryState = 'inaction';

                    const updateData = { state: newBatteryState, chargeLevel: newChargeLevel };
                    const batteryNewState = await axios.post('http://localhost:5005/batteries/updateBatteryById', 
                        {
                            params: {
                                batteryId: battery._id, 
                                updateData: updateData
                            }
                        });
                }

            const panelUpdateData = { currentPower: Pcurrent };
            const panelNewCurrentPower = await PanelModel.findByIdAndUpdate(panel._id, { $set: panelUpdateData }, { new: true });

            const historyDataCreateResult = {
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
                currentConsumption: currentConsumption,
                locationName: weatherData.name
            };

            const newHistoryRecord = await axios.post('http://localhost:5008/historyData/createNewHistoryDataRecord', {
                params: {
                    historyDataRecord: historyDataCreateResult
                }
            });
            
            const time = new Date();
            console.log('Date: ' + time + ', current producted power for panel system ' + panelSystemId + ' is: ' + Pcurrent);
            return res.status(201).json(Pcurrent);
            //return Pcurrent;

        }
        catch(error) {
            console.log(error);
            return res.status(500).json({message: "An error occured while calculating current Power for panel system: " + panelSystemId});
        }
    },

    calculateCurrentPanelPower: async function (installedPower, fOfTcells, cloudiness, sunset, sunrise, timestamp) {
        const lastEntryConstParams = await axios.get('http://localhost:5003/constParams/getLastConstParameters');
        const nPercent = lastEntryConstParams.n;

        let currentPower = installedPower * nPercent/100 * (1 - cloudiness/100) * fOfTcells;

        let isNight = await this.checkIfItsNightOfTimestamp(sunset, sunrise, timestamp);

        if(isNight) {
            return 0;
        }

        return currentPower;
    },

};

export default PanelService;