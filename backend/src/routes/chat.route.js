import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addGroupMembers,createGroup, getStreamToken,removeGroupMembers } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/group/create",protectRoute,createGroup);
router.post("/group/add", protectRoute, addGroupMembers);
router.post("/group/remove", protectRoute,removeGroupMembers );
export default router;
