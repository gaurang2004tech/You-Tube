import express from "express";
import { login, updateprofile, trackDownload, sendOtp, verifyOtp, getAllUsers } from "../controllers/auth.js";
const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateprofile);
routes.post("/download/:id", trackDownload);
routes.post("/send-otp", sendOtp);
routes.post("/verify-otp", verifyOtp);
routes.get("/all", getAllUsers);


export default routes;
