import { Router } from "express";
import { createPost, deletePost, featurePost, getAllPosts, getPost, uploadAuth } from "../controller/post.controller.js";
import postVisit from "../middleware/postVisits.js";
const router = Router()

router.get('/upload-auth',uploadAuth)
router.get('/',getAllPosts)
router.get('/:slug',postVisit,getPost)
router.post('/',createPost)
router.delete('/:id',deletePost)
router.patch('/feature',featurePost)

export default router