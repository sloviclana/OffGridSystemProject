import mongoose from 'mongoose';
import axios from 'axios';
import WeatherDataModel from '../../models/WeatherData.js';

const WeatherDataService = {
    updateWeatherDataForAllSystems: async function () {
        try {
            const panels = await axios.get('http://localhost:5004/panels/getAllPanels');
            const batteries = await axios.get('http://localhost:5005/batteries/getAllBatteries');

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
    }
};

export default WeatherDataService;