import { Router } from "express";
import { addComments, deleteComments, getPostComments } from "../controller/comment.controller.js";

const router = Router()

router.get('/:postId',getPostComments)
router.post('/:postId',addComments)
router.delete('/:id',deleteComments)

export default router