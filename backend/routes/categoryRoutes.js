const router = require('express').Router();
const categoryController = require("../controllers/categoryController");
const { authGuardAdmin } = require('../middleware/authGuard');

router.post("/create-category", authGuardAdmin, categoryController.createCategory)
router.get("/get-categories", categoryController.getAllCategory)
router.put("/unavailable/:id", authGuardAdmin, categoryController.unavailableCategory)
router.put("/update-category/:id", authGuardAdmin, categoryController.updateCategory)
router.delete("/delete-category/:id", authGuardAdmin, categoryController.deleteCategory)

module.exports = router;