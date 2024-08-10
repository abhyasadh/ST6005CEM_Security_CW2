const jwt = require("jsonwebtoken");

const authGuardAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({
      success: false,
      message: "Authorization header not found!",
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.json({
      success: false,
      message: "Token is required!",
    });
  }

  try {
      const decodeUser = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
      req.user = decodeUser;

      if (!req.user.isAdmin) {
          return res.json({
              success: false,
              message: "Permission Denied!"
          })
      }
      next();
  } catch (error) {
      res.json({
          success: false,
          message: "Invalid token!"
      }
      )
  }
}

module.exports = {authGuardAdmin};