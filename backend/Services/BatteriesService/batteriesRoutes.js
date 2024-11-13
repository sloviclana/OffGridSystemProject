import express from 'express';
import BatteriesService from './BatteriesService.js';

const router = express.Router();

router.post('/getAllBatteriesFromUser', BatteriesService.getAllBatteriesFromUser);
router.get('/getBatteryBySystemId', BatteriesService.getBatteryBySystemId);
router.post('/deleteBatteryBySystemId', BatteriesService.deleteBatteryBySystemId);
router.post('/updateBatteryById', BatteriesService.updateBatteryById);
router.get('/getAllBatteries', BatteriesService.getAllBatteries);
router.post('/createBattery', BatteriesService.createBattery);

export default router; 