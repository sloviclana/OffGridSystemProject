import express from 'express';
import UserAuthService from './UserAuthService.js';
import VerifyToken from '../../middleware/VerifyToken.js';

const router = express.Router();

router.post('/register', VerifyToken, UserAuthService.register);
router.post('/login', VerifyToken, UserAuthService.login);
router.post('/updateUserStatus', UserAuthService.updateUserStatus)

export default router;