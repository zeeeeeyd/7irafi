import express from 'express';
import auth from '../../middlewares/auth.js';
import { uploadMedia, handleMediaUpload } from '../../controllers/media.controller.js';

const router = express.Router();

router
  .route('/upload')
  .post(auth(), uploadMedia, handleMediaUpload);

export default router;