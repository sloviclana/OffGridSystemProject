import express from 'express';
import userAuthController from '../controllers/userAuthController.js';
import VerifyToken from '../middleware/VerifyToken.js';

const router = express.Router();

router.post('/register', VerifyToken, userAuthController.register);
router.post('/login', VerifyToken, userAuthController.login);

export default router;