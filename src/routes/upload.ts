import { Router } from "express";
import {
	deleteFile,
	getAllFiles,
	uploadFile,
	uploadMultipleFiles,
} from "../controllers/upload.js";
import { upload } from "../middleware/upload.js";

const router: Router = Router();

router.post("/", upload.single("file"), uploadFile);

router.post("/multiple", upload.array("files"), uploadMultipleFiles);

router.get("/", getAllFiles);

router.delete("/:id", deleteFile);

export default router;
