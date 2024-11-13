import express from 'express';
import HistoryDataService from './HistoryDataService.js';

const router = express.Router();

router.post('/createNewHistoryDataRecord', HistoryDataService.createNewHistoryDataRecord);
router.post('/updateHistoryDataForAllPanelSystems', HistoryDataService.updateHistoryDataForAllPanelSystems);
router.get('/getPanelProductionDataHistory', HistoryDataService.getPanelProductionDataHistory);
router.post('/generateHistoryDataReport', HistoryDataService.generateHistoryDataReport);
router.post('/updateWeatherDataForAllSystems', HistoryDataService.updateWeatherDataForAllSystems);
router.get('/getAllWeatherData', HistoryDataService.getAllWeatherData);

export default router; 