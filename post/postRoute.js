import express from 'express';
import {protectRoute  }from '../middleware/protectedRoute.js'
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from '../post/postController.js';


const router = express.Router();

router.post('/create', protectRoute, createPost);
router.post('/like/:id', protectRoute, likeUnlikePost);
router.get('/likes/:id',protectRoute,getLikedPosts);
router.get('/following',protectRoute,getFollowingPosts); //Pending
router.get('/user/:username',protectRoute,getUserPosts);
router.post('/comment/:id', protectRoute, commentOnPost);
router.delete('/deletePost/:id', protectRoute, deletePost);
router.get('/all', protectRoute, getAllPosts);



export default router
