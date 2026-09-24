const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Article title is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Academic', 'Campus Life', 'Admissions', 'Health & Research', 'General Announcement'],
        default: 'General Announcement'
    },
    excerpt: {
        type: String,
        required: [true, 'Excerpt/Summary is required'],
        trim: true,
        maxlength: 300
    },
    content: {
        type: String,
        required: [true, 'Article content is required']
    },
    featuredImage: {
        type: String,
        default: null
    },
    videoUrl: {
        type: String,
        default: null
    },
    author: {
        type: String,
        default: 'Office of Communications & Public Relations'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Helper to generate a URL-safe slug
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

// Pre-save hook to generate unique slug and set publishedAt
newsSchema.pre('save', async function (next) {
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    if (!this.isModified('title') && this.slug) {
        return next();
    }

    let baseSlug = slugify(this.title) || 'news-article';
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (true) {
        const existing = await mongoose.models.News.findOne({ 
            slug: uniqueSlug, 
            _id: { $ne: this._id } 
        });
        if (!existing) {
            this.slug = uniqueSlug;
            break;
        }
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
    }

    next();
});

const News = mongoose.model('News', newsSchema);

module.exports = News;
