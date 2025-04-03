require('dotenv').config();
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {

    try {
        const cookies = req.cookies;
        const { accessToken } = cookies;
        if (!accessToken) {
            throw new Error("Invalid Token");
        }

        const claims = await jwt.verify(accessToken, process.env.SECRET_KEY)
        const { userId } = claims;
        req.userId = userId;

        next();
    } catch (err) {
        res.status(401).send(err.message);
    }
};

module.exports = {
    userAuth
};