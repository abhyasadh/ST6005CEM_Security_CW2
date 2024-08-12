const express = require('express');
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authGuardAdmin } = require('../middleware/authGuard');

// Handler for method not allowed
function methodNotAllowed(req, res) {
    res.status(405).json({ message: "Method Not Allowed" });
}

router.route("/create-category")
    .post(authGuardAdmin, categoryController.createCategory)
    .all(methodNotAllowed);

router.route("/get-categories")
    .get(categoryController.getAllCategory)
    .all(methodNotAllowed);

router.route("/unavailable/:id")
    .put(authGuardAdmin, categoryController.unavailableCategory)
    .all(methodNotAllowed);

router.route("/update-category/:id")
    .put(authGuardAdmin, categoryController.updateCategory)
    .all(methodNotAllowed);

router.route("/delete-category/:id")
    .delete(authGuardAdmin, categoryController.deleteCategory)
    .all(methodNotAllowed);

module.exports = router;
