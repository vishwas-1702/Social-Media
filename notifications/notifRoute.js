import express from "express";
import { protectRoute } from "../middleware/protectedRoute.js";
import { deleteNotifications, getNotifications } from "./notifController.js";

const router = express.Router();

router.get("/v1/getNotificaton", protectRoute, getNotifications);
router.delete("/deleteNotification", protectRoute, deleteNotifications);

export default router;