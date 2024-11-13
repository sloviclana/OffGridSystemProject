import express from 'express';
import PanelService from './PanelsService.js';

const router = express.Router();

router.post('/getAllPanelsFromUser', PanelService.getAllPanelsFromUser);
router.post('/deletePanelBatterySystem', PanelService.deletePanelBatterySystem);
router.get('/getAllPanels', PanelService.getAllPanels);
router.post('/setPanelOnLocation', PanelService.setPanelOnLocation);
router.post('/calculatePowerProductionForPanelSystem', PanelService.calculatePowerProductionForPanelSystem)

export default router; 