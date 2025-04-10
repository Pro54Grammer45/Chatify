/*
In the file name (auth.route.js) the .route is not an extension but just depicts that the file is a part of the routes folder...it is just for our convinience
*/

import express from "express"
import { checkAuth, login, logout, signup, updateProfile} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute ,updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;