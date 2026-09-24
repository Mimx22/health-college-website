const News = require('../models/News');

// 1. Public: Get Published News Articles (with pagination, category filtering, search)
const getPublishedNews = async (req, res, next) => {
    try {
        const { category, search, limit = 10, page = 1 } = req.query;

        const query = { status: 'published' };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search.trim(), $options: 'i' } },
                { excerpt: { $regex: search.trim(), $options: 'i' } },
                { content: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        const total = await News.countDocuments(query);
        const news = await News.find(query)
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        res.status(200).json({
            success: true,
            count: news.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: news
        });
    } catch (error) {
        next(error);
    }
};

// 2. Public: Get Single Published News Article by Slug
const getNewsBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const article = await News.findOne({ slug, status: 'published' }).lean();

        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found or is unpublished' });
        }

        // Fetch up to 3 recent other published articles for related section
        const recent = await News.find({ 
            status: 'published', 
            _id: { $ne: article._id } 
        })
        .sort({ publishedAt: -1 })
        .limit(3)
        .select('title slug category featuredImage publishedAt excerpt')
        .lean();

        res.status(200).json({
            success: true,
            data: article,
            recent
        });
    } catch (error) {
        next(error);
    }
};

// 3. Admin: Get All News Articles (drafts, published, archived)
const getAllNewsAdmin = async (req, res, next) => {
    try {
        const news = await News.find({}).sort({ createdAt: -1 }).lean();
        res.status(200).json({
            success: true,
            count: news.length,
            data: news
        });
    } catch (error) {
        next(error);
    }
};

// 4. Admin: Get Single Article by ID
const getNewsByIdAdmin = async (req, res, next) => {
    try {
        const article = await News.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }
        res.status(200).json({
            success: true,
            data: article
        });
    } catch (error) {
        next(error);
    }
};

// 5. Admin: Create News Article
const createNewsAdmin = async (req, res, next) => {
    try {
        const { title, category, excerpt, content, featuredImage, videoUrl, author, status } = req.body;

        if (!title || !excerpt || !content) {
            return res.status(400).json({ success: false, message: 'Title, excerpt, and content are required' });
        }

        const article = new News({
            title,
            category: category || 'General Announcement',
            excerpt,
            content,
            featuredImage: featuredImage || null,
            videoUrl: videoUrl || null,
            author: author || 'Office of Communications & Public Relations',
            status: status || 'draft',
            publishedAt: status === 'published' ? new Date() : null
        });

        await article.save();

        res.status(201).json({
            success: true,
            message: `Article "${article.title}" successfully created (${article.status}).`,
            data: article
        });
    } catch (error) {
        next(error);
    }
};

// 6. Admin: Update News Article
const updateNewsAdmin = async (req, res, next) => {
    try {
        const { title, category, excerpt, content, featuredImage, videoUrl, author, status } = req.body;
        const article = await News.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        if (title !== undefined) article.title = title;
        if (category !== undefined) article.category = category;
        if (excerpt !== undefined) article.excerpt = excerpt;
        if (content !== undefined) article.content = content;
        if (featuredImage !== undefined) article.featuredImage = featuredImage;
        if (videoUrl !== undefined) article.videoUrl = videoUrl;
        if (author !== undefined) article.author = author;

        if (status !== undefined && status !== article.status) {
            article.status = status;
            if (status === 'published' && !article.publishedAt) {
                article.publishedAt = new Date();
            }
        }

        await article.save();

        res.status(200).json({
            success: true,
            message: 'Article updated successfully',
            data: article
        });
    } catch (error) {
        next(error);
    }
};

// 7. Admin: Delete News Article
const deleteNewsAdmin = async (req, res, next) => {
    try {
        const article = await News.findByIdAndDelete(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        res.status(200).json({
            success: true,
            message: `Article "${article.title}" deleted successfully`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPublishedNews,
    getNewsBySlug,
    getAllNewsAdmin,
    getNewsByIdAdmin,
    createNewsAdmin,
    updateNewsAdmin,
    deleteNewsAdmin
};
