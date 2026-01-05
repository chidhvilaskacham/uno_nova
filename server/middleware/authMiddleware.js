const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
};

const verifiedOnly = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({ message: 'Email verification required to access this feature' });
    }
    next();
};

module.exports = {
    authenticateToken,
    verifiedOnly
};
