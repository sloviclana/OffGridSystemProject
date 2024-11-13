import express from 'express';
import WeatherDataService from './WeatherDataService.js';

const router = express.Router();

router.post('/updateWeatherDataForAllSystems', WeatherDataService.updateWeatherDataForAllSystems);
router.get('/getAllWeatherData', WeatherDataService.getAllWeatherData);

export default router;