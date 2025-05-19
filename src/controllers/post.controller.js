import httpStatus from 'http-status';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import { postService } from '../services/index.js';
import { deleteFromCloudinary, getPublicIdFromUrl } from '../config/clouadinary.js';

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

  // If media is being updated, handle deletion of old media from Cloudinary
  if (req.body.media && post.media) {
    // Find media that are in the old post but not in the new update (these should be deleted)
    const newMediaUrls = req.body.media.map(media => media.url);
    const mediaToDelete = post.media.filter(media => !newMediaUrls.includes(media.url));

    // Delete removed media from Cloudinary
    await Promise.all(mediaToDelete.map(async (media) => {
      const publicId = getPublicIdFromUrl(media.url);
      if (publicId) {
        await deleteFromCloudinary(publicId, media.type);
      }
    }));
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
  
  // Delete all media from Cloudinary
  if (post.media && post.media.length > 0) {
    await Promise.all(post.media.map(async (media) => {
      const publicId = getPublicIdFromUrl(media.url);
      if (publicId) {
        await deleteFromCloudinary(publicId, media.type);
      }
    }));
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