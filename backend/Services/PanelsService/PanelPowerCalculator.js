import mongoose from 'mongoose';
import PanelModel from '../../models/Panel.js';
import axios from 'axios';

const PanelPowerCalculator = {
    checkIfItsNight: async function (sunset, sunrise) {
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

    calculateCellsTemperature: async function (temperature, cloudiness, lastEntryConstParams) {
        try {
            //const lastEntryConstParamsResult = await axios.get('http://localhost:5003/constParams/getLastConstParameters', { timeout: 10000 });
            //const lastEntryConstParams = lastEntryConstParamsResult.data;
            const k = lastEntryConstParams.k;

            let Tcells = temperature + (1 - cloudiness/100)*k;
            return Tcells;
        }
        catch (error) {
            console.log("Cannot calculate cells temperature", error);
        }
    },

    calculateFunctionOfCellsTemperature: async function (cellsTemperature, lastEntryConstParams) {
        try {
            //const lastEntryConstParamsResult = await axios.get('http://localhost:5003/constParams/getLastConstParameters');
            //const lastEntryConstParams = lastEntryConstParamsResult.data;
            const B = lastEntryConstParams.B;
            const Tref = lastEntryConstParams.Tref;

            let temperatureDifference = cellsTemperature - Tref;
            if(temperatureDifference < 0) {
                temperatureDifference = temperatureDifference * (-1);   //apsolutna vrednost
            }

            let fOfTcells = 1 - B * temperatureDifference;

            return fOfTcells;
        }
        catch (error) {
            console.log("Cannot calculate function of cells temperature", error);
        }
    },


    calculateCurrentPower: async (panel, weatherData) => {
        try{
            //5003
            const lastEntryConstParamsResult = await axios.get('http://localhost:5003/constParams/getLastConstParameters');
            const lastEntryConstParams = lastEntryConstParamsResult.data;
            let Ptrenutno = 0;
            const sunset = new Date(weatherData.sys.sunset * 1000);
            const sunrise = new Date(weatherData.sys.sunrise * 1000);
            const sunsetTime = sunset.getHours() * 3600 + sunset.getMinutes() * 60 + sunset.getSeconds();
            const sunriseTime = sunrise.getHours() * 3600 + sunrise.getMinutes() * 60 + sunrise.getSeconds();
            const nowTime = new Date();
            const currentTime = nowTime.getHours() * 3600 + nowTime.getMinutes() * 60 + nowTime.getSeconds();

            let isNight = currentTime >= sunsetTime || currentTime <= sunriseTime;

            if(isNight) {
                Ptrenutno = 0;
                const panelUpdateData = { currentPower: Ptrenutno };
                const panelNewCurrentPower = await PanelModel.findByIdAndUpdate(panel._id, { $set: panelUpdateData }, { new: true });
            } else {
                let Tcells = weatherData.main.temp + (1 - weatherData.clouds.all/100)*lastEntryConstParams.k;
                
                let temperatureDifference = Tcells - lastEntryConstParams.Tref;
                if(temperatureDifference < 0) {
                    temperatureDifference = temperatureDifference * (-1);   //apsolutna vrednost
                }

                let fTcelija = 1 - lastEntryConstParams.B * temperatureDifference;
                Ptrenutno = panel.installedPower * lastEntryConstParams.n/100 * (1 - weatherData.clouds.all/100) * fTcelija;
            }
           
            return Ptrenutno;
        }
        catch(error) {
            console.log("Could not calculate current power.", error);
        }
    },


};

export default PanelPowerCalculator;