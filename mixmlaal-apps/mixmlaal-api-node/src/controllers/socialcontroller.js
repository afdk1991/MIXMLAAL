const { Post, Comment, Like, User, Collection } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

class SocialController {
  async createPost(req, res) {
    try {
      const userId = req.user.id;
      const { content, images } = req.body;

      if (!content && !images) {
        return res.json({
          code: 400,
          message: '内容或图片不能为空',
          data: null
        });
      }

      const post = await Post.create({
        userId,
        content: content || '',
        images: images || '',
        likes: 0,
        comments: 0,
        status: 'active'
      });

      const user = await User.findByPk(userId, { attributes: ['id', 'username', 'name', 'avatar'] });

      res.json({
        code: 200,
        message: '发布动态成功',
        data: {
          id: post.id,
          content: post.content,
          images: post.images,
          likes: post.likes,
          comments: post.comments,
          createdAt: post.createdAt,
          user: user
        }
      });
    } catch (error) {
      console.error('发布动态失败:', error);
      res.status(500).json({
        code: 500,
        message: '发布动态失败',
        data: null
      });
    }
  }

  async getPosts(req, res) {
    try {
      const { page = 1, pageSize = 10, userId, type = 'all' } = req.query;

      const where = { status: 'active' };
      if (userId) {
        where.userId = userId;
      }

      const { count, rows } = await Post.findAndCountAll({
        where,
        include: [{
          model: User,
          attributes: ['id', 'username', 'name', 'avatar']
        }],
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']]
      });

      const posts = rows.map(post => ({
        id: post.id,
        content: post.content,
        images: post.images,
        likes: post.likes,
        comments: post.comments,
        createdAt: post.createdAt,
        user: post.User
      }));

      res.json({
        code: 200,
        message: '获取动态列表成功',
        data: {
          items: posts,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取动态列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取动态列表失败',
        data: null
      });
    }
  }

  async getPostDetail(req, res) {
    try {
      const { postId } = req.params;

      const post = await Post.findOne({
        where: { id: postId, status: 'active' },
        include: [{
          model: User,
          attributes: ['id', 'username', 'name', 'avatar']
        }]
      });

      if (!post) {
        return res.json({
          code: 404,
          message: '动态不存在',
          data: null
        });
      }

      const comments = await Comment.findAll({
        where: { postId: post.id },
        include: [{
          model: User,
          attributes: ['id', 'username', 'name', 'avatar']
        }],
        order: [['createdAt', 'ASC']]
      });

      res.json({
        code: 200,
        message: '获取动态详情成功',
        data: {
          post: {
            id: post.id,
            content: post.content,
            images: post.images,
            likes: post.likes,
            comments: post.comments,
            createdAt: post.createdAt,
            user: post.User
          },
          comments: comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            user: comment.User
          }))
        }
      });
    } catch (error) {
      console.error('获取动态详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取动态详情失败',
        data: null
      });
    }
  }

  async likePost(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;

      const post = await Post.findByPk(postId);
      if (!post) {
        return res.json({
          code: 404,
          message: '动态不存在',
          data: null
        });
      }

      const existingLike = await Like.findOne({
        where: { userId, postId, type: 'post' }
      });

      if (existingLike) {
        await existingLike.destroy();
        await post.decrement('likes');
        return res.json({
          code: 200,
          message: '取消点赞成功',
          data: { liked: false, likes: post.likes - 1 }
        });
      }

      await Like.create({
        userId,
        postId,
        type: 'post'
      });

      await post.increment('likes');

      res.json({
        code: 200,
        message: '点赞成功',
        data: { liked: true, likes: post.likes + 1 }
      });
    } catch (error) {
      console.error('点赞失败:', error);
      res.status(500).json({
        code: 500,
        message: '点赞失败',
        data: null
      });
    }
  }

  async addComment(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const { content, parentId } = req.body;

      if (!content) {
        return res.json({
          code: 400,
          message: '评论内容不能为空',
          data: null
        });
      }

      const post = await Post.findByPk(postId);
      if (!post) {
        return res.json({
          code: 404,
          message: '动态不存在',
          data: null
        });
      }

      const comment = await Comment.create({
        postId,
        userId,
        content,
        parentId: parentId || null
      });

      await post.increment('comments');

      const user = await User.findByPk(userId, { attributes: ['id', 'username', 'name', 'avatar'] });

      res.json({
        code: 200,
        message: '评论成功',
        data: {
          id: comment.id,
          content: comment.content,
          parentId: comment.parentId,
          createdAt: comment.createdAt,
          user: user
        }
      });
    } catch (error) {
      console.error('评论失败:', error);
      res.status(500).json({
        code: 500,
        message: '评论失败',
        data: null
      });
    }
  }

  async getComments(req, res) {
    try {
      const { postId, page = 1, pageSize = 20 } = req.params;

      const { count, rows } = await Comment.findAndCountAll({
        where: { postId, parentId: null },
        include: [{
          model: User,
          attributes: ['id', 'username', 'name', 'avatar']
        }],
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'ASC']]
      });

      const comments = [];
      for (const comment of rows) {
        const replies = await Comment.findAll({
          where: { parentId: comment.id },
          include: [{
            model: User,
            attributes: ['id', 'username', 'name', 'avatar']
          }],
          order: [['createdAt', 'ASC']]
        });

        comments.push({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          user: comment.User,
          replies: replies.map(reply => ({
            id: reply.id,
            content: reply.content,
            createdAt: reply.createdAt,
            user: reply.User
          }))
        });
      }

      res.json({
        code: 200,
        message: '获取评论列表成功',
        data: {
          items: comments,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取评论列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取评论列表失败',
        data: null
      });
    }
  }

  async deletePost(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;

      const post = await Post.findOne({
        where: { id: postId, userId }
      });

      if (!post) {
        return res.json({
          code: 404,
          message: '动态不存在或无权删除',
          data: null
        });
      }

      await post.update({ status: 'deleted' });

      res.json({
        code: 200,
        message: '删除动态成功',
        data: null
      });
    } catch (error) {
      console.error('删除动态失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除动态失败',
        data: null
      });
    }
  }

  async getLikedPosts(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 10 } = req.query;

      const likes = await Like.findAll({
        where: { userId, type: 'post' },
        include: [{
          model: Post,
          where: { status: 'active' },
          include: [{
            model: User,
            attributes: ['id', 'username', 'name', 'avatar']
          }]
        }],
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']]
      });

      const posts = likes.map(like => ({
        id: like.Post.id,
        content: like.Post.content,
        images: like.Post.images,
        likes: like.Post.likes,
        comments: like.Post.comments,
        createdAt: like.Post.createdAt,
        user: like.Post.User
      }));

      res.json({
        code: 200,
        message: '获取点赞动态成功',
        data: {
          items: posts,
          total: likes.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取点赞动态失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取点赞动态失败',
        data: null
      });
    }
  }

  async searchPosts(req, res) {
    try {
      const { keyword, page = 1, pageSize = 10 } = req.query;

      if (!keyword) {
        return res.json({
          code: 400,
          message: '搜索关键词不能为空',
          data: null
        });
      }

      const { count, rows } = await Post.findAndCountAll({
        where: {
          status: 'active',
          content: { [Op.like]: `%${keyword}%` }
        },
        include: [{
          model: User,
          attributes: ['id', 'username', 'name', 'avatar']
        }],
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']]
      });

      const posts = rows.map(post => ({
        id: post.id,
        content: post.content,
        images: post.images,
        likes: post.likes,
        comments: post.comments,
        createdAt: post.createdAt,
        user: post.User
      }));

      res.json({
        code: 200,
        message: '搜索动态成功',
        data: {
          items: posts,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('搜索动态失败:', error);
      res.status(500).json({
        code: 500,
        message: '搜索动态失败',
        data: null
      });
    }
  }

  // 第三方登录相关方法
  async getOAuthUrl(req, res) {
    try {
      const { provider } = req.params;
      const providers = ['wechat', 'qq', 'weibo'];

      if (!providers.includes(provider)) {
        return res.json({
          code: 400,
          message: '不支持的第三方登录方式',
          data: null
        });
      }

      const state = crypto.randomBytes(16).toString('hex');
      const redirectUrl = `http://localhost:8080/api/v1/social/oauth/${provider}/callback`;
      
      let authUrl = '';
      if (provider === 'wechat') {
        authUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=YOUR_APPID&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
      } else if (provider === 'qq') {
        authUrl = `https://graph.qq.com/oauth2.0/authorize?client_id=YOUR_APPID&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&state=${state}`;
      } else if (provider === 'weibo') {
        authUrl = `https://api.weibo.com/oauth2/authorize?client_id=YOUR_APPID&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&state=${state}`;
      }

      res.json({
        code: 200,
        message: '获取第三方登录URL成功',
        data: {
          authUrl,
          state
        }
      });
    } catch (error) {
      console.error('获取第三方登录URL失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取第三方登录URL失败',
        data: null
      });
    }
  }

  async oauthCallback(req, res) {
    try {
      const { provider, code, state } = req.params;
      
      // 这里应该实现第三方登录的回调逻辑
      // 验证code，获取用户信息，创建或登录用户
      
      res.json({
        code: 200,
        message: '第三方登录回调成功',
        data: {
          provider,
          code,
          state
        }
      });
    } catch (error) {
      console.error('第三方登录回调失败:', error);
      res.status(500).json({
        code: 500,
        message: '第三方登录回调失败',
        data: null
      });
    }
  }

  async bindThirdParty(req, res) {
    try {
      const userId = req.user.id;
      const { provider } = req.params;
      const { openId, accessToken } = req.body;

      // 这里应该实现绑定第三方账号的逻辑
      
      res.json({
        code: 200,
        message: '绑定第三方账号成功',
        data: {
          userId,
          provider,
          openId
        }
      });
    } catch (error) {
      console.error('绑定第三方账号失败:', error);
      res.status(500).json({
        code: 500,
        message: '绑定第三方账号失败',
        data: null
      });
    }
  }

  async unbindThirdParty(req, res) {
    try {
      const userId = req.user.id;
      const { provider } = req.params;

      // 这里应该实现解绑第三方账号的逻辑
      
      res.json({
        code: 200,
        message: '解绑第三方账号成功',
        data: {
          userId,
          provider
        }
      });
    } catch (error) {
      console.error('解绑第三方账号失败:', error);
      res.status(500).json({
        code: 500,
        message: '解绑第三方账号失败',
        data: null
      });
    }
  }

  async getThirdPartyStatus(req, res) {
    try {
      const userId = req.user.id;

      // 这里应该实现获取第三方账号绑定状态的逻辑
      const status = {
        wechat: false,
        qq: false,
        weibo: false
      };

      res.json({
        code: 200,
        message: '获取第三方账号绑定状态成功',
        data: status
      });
    } catch (error) {
      console.error('获取第三方账号绑定状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取第三方账号绑定状态失败',
        data: null
      });
    }
  }
}

module.exports = new SocialController();
