const adminAuth = (req, res, next) => {
    const adminSecret = process.env.ADMIN_SECRET;
    const provided = req.headers['x-admin-secret'];

    if (!adminSecret) {
        return res.status(500).json({ message: 'Admin secret not configured on server' });
    }

    if (!provided || provided !== adminSecret) {
        return res.status(401).json({ message: 'Unauthorized: admin credentials required' });
    }

    next();
};

module.exports = { adminAuth };
