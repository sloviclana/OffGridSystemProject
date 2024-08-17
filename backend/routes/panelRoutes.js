import express from 'express';
import panelsBatteriesController from '../controllers/panelsBatteriesController.js';

const router = express.Router();

router.post('/getAllPanelsFromUser', panelsBatteriesController.getAllPanelsFromUser);
router.post('/getAllBatteriesFromUser', panelsBatteriesController.getAllBatteriesFromUser);
router.post('/deletePanelBatterySystem', panelsBatteriesController.deletePanelBatterySystem);

export default router; 