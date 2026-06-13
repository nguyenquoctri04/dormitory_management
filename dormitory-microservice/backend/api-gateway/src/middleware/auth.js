const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized - No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "access-secret-key");
    
    // Add user info to headers so microservices can use it
    req.headers["x-user-id"] = decoded.userId;
    req.headers["x-user-role"] = decoded.role;
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Gateway Auth Error:", error.message);
    return res.status(401).json({
      message: "Unauthorized - Invalid or expired token",
    });
  }
};