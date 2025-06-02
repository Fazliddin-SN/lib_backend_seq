const jwt = require("jsonwebtoken");
require("dotenv").config();

// verify token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided!",
      });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          error: err,
        });
      }
      // console.log(decoded);

      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
// check authorization
const roleGuard = (...role) => {
  return (req, res, next) => {
    const userRole = req.user.role_id;
    // console.log("user role ", userRole, role);

    if (role.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
  };
};

module.exports = { verifyToken, roleGuard };
