
require("dotenv").config()
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

console.log("JWT_SECRET", JWT_SECRET)

function authmw(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "không có bearer Token" });
  }

  const authToken = authHeader.split(" ")[1];

  if (!authToken) {
    return res.status(401).json({ message: "Token không hợp lệ!" });
  }

  try {
    const decoded = jwt.verify(authToken, JWT_SECRET);
    req.user = decoded;

    if (!req.user.userId) {
      return res.status(403).json({ message: "payload token không hợp lệ" });
    }

    next();
  } catch (error) {
    console.log("JWT verify error:", error);
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
}

module.exports = authmw;
