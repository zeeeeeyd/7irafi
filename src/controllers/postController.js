import Post from '../models/postModel.js';
import { logger } from '../utils/logger.js';

/**
 * Create a new post
 * @route POST /api/posts
 * @access Private/Artisan
 */
export const createPost = async (req, res, next) => {
  try {
    const { title, description, category, price, tags, location, isAvailable } = req.body;

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(file.path);
      });
    }

    // Create post
    const post = await Post.create({
      title,
      description,
      images,
      author: req.user._id,
      category,
      tags: tags || [],
      price,
      location,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all posts
 * @route GET /api/posts
 * @access Public
 */
export const getPosts = async (req, res, next) => {
  try {
    // Initialize query
    let query = Post.find().populate({
      path: 'author',
      select: 'name profileImage',
    });

    // Filter by category
    if (req.query.category) {
      query = query.where('category').equals(req.query.category);
    }

    // Filter by tags
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      query = query.where('tags').in(tags);
    }

    // Filter by price range
    if (req.query.minPrice) {
      query = query.where('price').gte(Number(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      query = query.where('price').lte(Number(req.query.maxPrice));
    }

    // Filter by location
    if (req.query.location) {
      query = query.where('location').regex(new RegExp(req.query.location, 'i'));
    }

    // Filter by availability
    if (req.query.isAvailable !== undefined) {
      query = query.where('isAvailable').equals(req.query.isAvailable === 'true');
    }

    // Filter by author
    if (req.query.author) {
      query = query.where('author').equals(req.query.author);
    }

    // Search by title or description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ]);
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Sort
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    query = query.sort({ [sortBy]: sortOrder });

    // Execute query
    const posts = await query;

    // Get total count
    const totalPosts = await Post.countDocuments(query.getFilter());

    res.status(200).json({
      success: true,
      count: posts.length,
      total: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get post by ID
 * @route GET /api/posts/:id
 * @access Public
 */
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: 'author',
      select: 'name profileImage bio location',
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update post
 * @route PUT /api/posts/:id
 * @access Private/Artisan
 */
export const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Check if user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post',
      });
    }

    const { 
      title, 
      description, 
      category, 
      price, 
      tags, 
      location, 
      isAvailable 
    } = req.body;

    // Build update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (category) updateFields.category = category;
    if (price !== undefined) updateFields.price = price;
    if (tags) updateFields.tags = tags;
    if (location !== undefined) updateFields.location = location;
    if (isAvailable !== undefined) updateFields.isAvailable = isAvailable;

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      updateFields.images = req.files.map(file => file.path);
    }

    // Update post
    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate({
      path: 'author',
      select: 'name profileImage',
    });

    res.status(200).json({
      success: true,
      data: post,
      message: 'Post updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete post
 * @route DELETE /api/posts/:id
 * @access Private/Artisan
 */
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Check if user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post',
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get posts by current user
 * @route GET /api/posts/user/me
 * @access Private
 */
export const getCurrentUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name profileImage',
      });

    const totalPosts = await Post.countDocuments({ author: req.user._id });

    res.status(200).json({
      success: true,
      count: posts.length,
      total: totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};