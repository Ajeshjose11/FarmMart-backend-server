const jwt = require("jsonwebtoken");

const jwtMiddleware = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.jwtKey);
      req.userId = decoded.id; 
      req.userRole = decoded.role;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid Token" });
    }
  } else {
    return res.status(401).json({ message: "No Token Provided" });
  }
};

module.exports = jwtMiddleware;
