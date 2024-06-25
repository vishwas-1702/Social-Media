import express from 'express';
import { protectRoute } from '../middleware/protectedRoute.js';
import { followunfollowUser, getSuggestedUsers, getUserProfile, updateUser } from './userController.js';

const router = express.Router();

router.get('/profile/:username', protectRoute,getUserProfile)
router.get('/suggested',protectRoute, getSuggestedUsers)
router.post('/follow/:id', protectRoute ,followunfollowUser)
router.put('/updateMe', protectRoute ,updateUser)
//test

export default router;