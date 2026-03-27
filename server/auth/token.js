const jwt = require("jsonwebtoken");
require("dotenv").config({ path: [".env.local", ".env"] });

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev_only";

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };
