import { Router } from "express";
import { clerkWebHook } from "../controller/webhook.controller.js";
import bodyParser from "body-parser";

const router = Router()

router.post('/clerk',bodyParser.raw({ type: 'application/json' }),clerkWebHook)

export default router