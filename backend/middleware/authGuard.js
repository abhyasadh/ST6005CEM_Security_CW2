const authGuardAdmin = (req, res, next) => {
  // Check if session data is available
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized! Please log in.",
    });
  }

  // Check if the user is an admin
  if (!req.session.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Permission Denied! Admins only.",
    });
  }

  // Proceed to the next middleware or route handler
  next();
};

module.exports = { authGuardAdmin };