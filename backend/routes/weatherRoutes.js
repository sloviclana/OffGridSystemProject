import express from 'express';
import mapController from '../controllers/mapController.js';

const router = express.Router();

router.post('/setPanelOnLocation', mapController.setPanelOnLocation);

export default router; 