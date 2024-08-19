import express from 'express';
import usersController from '../controllers/usersController.js';

const router = express.Router();

router.post('/getAllUsers', usersController.getAllUsers);
router.post('/blockUser', usersController.blockUser);
router.post('/unblockUser', usersController.unblockUser);
router.get('/getLastConstParameters', usersController.getLastConstParameters);
router.post('/setNewConstParameters', usersController.setNewConstParameters);

export default router;