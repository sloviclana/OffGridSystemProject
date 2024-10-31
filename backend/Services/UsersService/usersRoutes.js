import express from 'express';
import UsersService from './UsersService.js';

const router = express.Router();

router.post('/getAllUsers', UsersService.getAllUsers);
router.post('/blockUser', UsersService.blockUser);
router.post('/unblockUser', UsersService.unblockUser);
//router.get('/getLastConstParameters', UsersService.getLastConstParameters);
//router.post('/setNewConstParameters', UsersService.setNewConstParameters);

export default router;