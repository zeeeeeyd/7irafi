import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { postService } from '../services/index.js';

const createPost = catchAsync(async (req, res) => {
  const post = await postService.createPost({
    ...req.body,
    user: req.user.id,
  });
  res.status(httpStatus.CREATED).send(post);
});

const getPosts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'category', 'postType', 'price', 'user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await postService.queryPosts(filter, options);
  res.send(result);
});

const getPost = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.send(post);
});

const updatePost = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  
  // Check if the user is the owner of the post
  if (post.user.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this post');
  }
  
  const updatedPost = await postService.updatePostById(req.params.postId, req.body);
  res.send(updatedPost);
});

const deletePost = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  
  // Check if the user is the owner of the post
  if (post.user.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to delete this post');
  }
  
  await postService.deletePostById(req.params.postId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};