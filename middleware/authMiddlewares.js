const jwt = require("jsonwebtoken");
const config = require("config");

exports.AuthMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") next();

  try {
    const token = req.cookies.accessToken;
    if (!token) res.status(403).json({ message: "token not defined" });

    const decoded = jwt.verify(token, config.get("jwt_secret"));
    if (!decoded) return res.status(403).json({ message: "uncorent token" });

    req.userID = decoded.userID;
    next();
  } catch (e) {
    res.status(500).json({ message: "server error" });
  }
};
