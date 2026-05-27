import express from "express";
import { getallvideo, uploadvideo, getVideosByUploader } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadvideo);
routes.get("/getall", getallvideo);
routes.get("/byuser/:uploaderId", getVideosByUploader);
export default routes;
