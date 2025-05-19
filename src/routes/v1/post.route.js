import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import postValidation from '../../validations/post.validation.js';
import postController from '../../controllers/post.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(postValidation.createPost), postController.createPost)
  .get(validate(postValidation.getPosts), postController.getPosts);

router
  .route('/:postId')
  .get(validate(postValidation.getPost), postController.getPost)
  .put(auth(), validate(postValidation.updatePost), postController.updatePost)
  .delete(auth(), validate(postValidation.deletePost), postController.deletePost);

export default router;