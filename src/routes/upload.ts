import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadFile, uploadMultipleFiles, getAllFiles, deleteFile } from '../controllers/upload.js';

const router: Router = Router();


router.post('/', upload.single('file'), uploadFile);


router.post('/multiple', upload.array('files'), uploadMultipleFiles);


router.get('/', getAllFiles);


router.delete('/:id', deleteFile);

export default router;
