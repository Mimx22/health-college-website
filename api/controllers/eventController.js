const Event = require('../models/Event');

// 1. Public: Get Published Events (support filter: upcoming, past, category)
const getPublishedEvents = async (req, res, next) => {
    try {
        const { category, type = 'all', limit = 10, page = 1 } = req.query;

        const query = { status: 'published' };

        if (category && category !== 'All') {
            query.category = category;
        }

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (type === 'upcoming') {
            query.eventDate = { $gte: now };
        } else if (type === 'past') {
            query.eventDate = { $lt: now };
        }

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        // For upcoming, sort ascending by event date; otherwise sort descending
        const sortOrder = type === 'upcoming' ? { eventDate: 1 } : { eventDate: -1 };

        const total = await Event.countDocuments(query);
        const events = await Event.find(query)
            .sort(sortOrder)
            .skip(skip)
            .limit(limitNum)
            .lean();

        res.status(200).json({
            success: true,
            count: events.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: events
        });
    } catch (error) {
        next(error);
    }
};

// 2. Public: Get Single Event by Slug
const getEventBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const event = await Event.findOne({ slug, status: 'published' }).lean();

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found or is unpublished' });
        }

        // Fetch up to 3 other upcoming events
        const upcoming = await Event.find({ 
            status: 'published',
            _id: { $ne: event._id }
        })
        .sort({ eventDate: 1 })
        .limit(3)
        .select('title slug category featuredImage eventDate startTime location shortDescription')
        .lean();

        res.status(200).json({
            success: true,
            data: event,
            upcoming
        });
    } catch (error) {
        next(error);
    }
};

// 3. Admin: Get All Events (drafts, published, archived)
const getAllEventsAdmin = async (req, res, next) => {
    try {
        const events = await Event.find({}).sort({ eventDate: -1, createdAt: -1 }).lean();
        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

// 4. Admin: Get Single Event by ID
const getEventByIdAdmin = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
};

// 5. Admin: Create Event
const createEventAdmin = async (req, res, next) => {
    try {
        const {
            title,
            category,
            shortDescription,
            fullDescription,
            featuredImage,
            videoUrl,
            eventDate,
            startTime,
            endTime,
            location,
            organizer,
            status
        } = req.body;

        if (!title || !shortDescription || !fullDescription || !eventDate || !startTime) {
            return res.status(400).json({
                success: false,
                message: 'Title, short description, full description, event date, and start time are required'
            });
        }

        const event = new Event({
            title,
            category: category || 'Academic Schedule',
            shortDescription,
            fullDescription,
            featuredImage: featuredImage || null,
            videoUrl: videoUrl || null,
            eventDate: new Date(eventDate),
            startTime,
            endTime: endTime || '',
            location: location || 'Main Campus Auditorium, Jos',
            organizer: organizer || 'Jos Medical College Directorate',
            status: status || 'draft',
            publishedAt: status === 'published' ? new Date() : null
        });

        await event.save();

        res.status(201).json({
            success: true,
            message: `Event "${event.title}" created successfully (${event.status}).`,
            data: event
        });
    } catch (error) {
        next(error);
    }
};

// 6. Admin: Update Event
const updateEventAdmin = async (req, res, next) => {
    try {
        const {
            title,
            category,
            shortDescription,
            fullDescription,
            featuredImage,
            videoUrl,
            eventDate,
            startTime,
            endTime,
            location,
            organizer,
            status
        } = req.body;

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (title !== undefined) event.title = title;
        if (category !== undefined) event.category = category;
        if (shortDescription !== undefined) event.shortDescription = shortDescription;
        if (fullDescription !== undefined) event.fullDescription = fullDescription;
        if (featuredImage !== undefined) event.featuredImage = featuredImage;
        if (videoUrl !== undefined) event.videoUrl = videoUrl;
        if (eventDate !== undefined) event.eventDate = new Date(eventDate);
        if (startTime !== undefined) event.startTime = startTime;
        if (endTime !== undefined) event.endTime = endTime;
        if (location !== undefined) event.location = location;
        if (organizer !== undefined) event.organizer = organizer;

        if (status !== undefined && status !== event.status) {
            event.status = status;
            if (status === 'published' && !event.publishedAt) {
                event.publishedAt = new Date();
            }
        }

        await event.save();

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });
    } catch (error) {
        next(error);
    }
};

// 7. Admin: Delete Event
const deleteEventAdmin = async (req, res, next) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({
            success: true,
            message: `Event "${event.title}" deleted successfully`
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPublishedEvents,
    getEventBySlug,
    getAllEventsAdmin,
    getEventByIdAdmin,
    createEventAdmin,
    updateEventAdmin,
    deleteEventAdmin
};
