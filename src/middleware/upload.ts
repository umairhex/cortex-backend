import fs from "node:fs";
import path from "node:path";
import multer from "multer";

/**
 * Upload directory.
 * Creates directory if it doesn't exist.
 */
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Multer storage configuration.
 * Sets file destination and filename.
 */
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, uploadDir);
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const ext = path.extname(file.originalname);
		cb(null, `file-${uniqueSuffix}${ext}`);
	},
});

/**
 * File filter function for multer.
 * Checks if file is allowed based on MIME type.
 */
const fileFilter = (
	// biome-ignore lint/suspicious/noExplicitAny: Multer types compatibility
	_req: any,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	const allowed = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"application/pdf",
		"text/plain",
	];

	if (allowed.includes(file.mimetype) || file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};
/**
 * Multer instance for file uploads.
 * Configures storage and file filtering.
 */
export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024,
	},
});
