const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
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
        enum: ['Workshop', 'Seminar', 'Ceremony', 'Health Outreach', 'Academic Schedule', 'Sports & Social'],
        default: 'Academic Schedule'
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: 300
    },
    fullDescription: {
        type: String,
        required: [true, 'Full event description is required']
    },
    featuredImage: {
        type: String,
        default: null
    },
    videoUrl: {
        type: String,
        default: null
    },
    eventDate: {
        type: Date,
        required: [true, 'Event date is required']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required (e.g. 10:00 AM)']
    },
    endTime: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        required: [true, 'Event venue / location is required'],
        default: 'Main Campus Auditorium, Jos'
    },
    organizer: {
        type: String,
        default: 'Jos Medical College Directorate'
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
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// Pre-save hook to generate unique slug and set publishedAt
eventSchema.pre('save', async function (next) {
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    if (!this.isModified('title') && this.slug) {
        return next();
    }

    let baseSlug = slugify(this.title) || 'college-event';
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (true) {
        const existing = await mongoose.models.Event.findOne({ 
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

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
