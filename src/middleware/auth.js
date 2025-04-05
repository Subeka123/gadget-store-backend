const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

const authenticateJWT = (req, res, next) => {
    console.log(req.header);
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(token.split(" ")[1], secret, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = decoded;
        next();
    });
};

module.exports = authenticateJWT;