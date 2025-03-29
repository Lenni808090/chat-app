import express from "express"
const router = express.Router();
import { protectRoute } from "../middleware/auth.middleware.js";
import {sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests, getSentFriendRequests, getAddableUsers } from "../controllers/friendRequest.controler.js"

router.post("/send/:id", protectRoute, sendFriendRequest);
router.post("/accept/:id", protectRoute, acceptFriendRequest);
router.post("/reject/:id", protectRoute, rejectFriendRequest);

router.get("/", protectRoute, getFriendRequests);
router.get("/sent", protectRoute, getSentFriendRequests);
router.get("/search/users", protectRoute, getAddableUsers);




export default router;