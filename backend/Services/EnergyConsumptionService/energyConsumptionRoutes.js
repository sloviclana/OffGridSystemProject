import express from 'express';
import EnergyConsumptionService from './EnergyConsumptionService.js';

const router = express.Router();

router.get('/getCurrentConsumption', EnergyConsumptionService.getCurrentConsumption);
router.get('/findConsumptionDataByHourRange', EnergyConsumptionService.findConsumptionDataByHourRange);

export default router; 