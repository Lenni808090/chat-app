import express from "express"
import { login, logout, signup, checkAuth, updateProfile} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

//post um sachen in die db zu schreiben
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

//protectRoute: nur updaten wenn man loged in ist
//put um existierende sachen upzudaten
router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);
export default router;
