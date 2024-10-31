import express from 'express';
import ConstantParametersService from './ConstantParametersService.js';

const router = express.Router();

router.get('/getLastConstParameters', ConstantParametersService.getLastConstParameters);
router.post('/setNewConstParameters', ConstantParametersService.setNewConstParameters);

export default router;