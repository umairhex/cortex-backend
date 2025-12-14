import multer from 'multer';
import path from 'path';
import fs from 'fs';


const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'file-' + uniqueSuffix + ext);
    },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
   
    const allowed = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain'
    ];

    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
