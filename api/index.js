module.exports = (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'PURE VERCEL FUNCTION IS LIVE',
        time: new Date().toISOString()
    });
};
