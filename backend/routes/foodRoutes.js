const router = require('express').Router();
const foodController = require("../controllers/foodController");
const { authGuardAdmin } = require('../middleware/authGuard');

router.post("/create-food", authGuardAdmin, foodController.createFood)
router.get("/get-foods", foodController.getAllFood)
router.get("/get-selected/:categoryId", foodController.getSelectedFood)
router.put("/unavailable/:id", authGuardAdmin, foodController.unavailableFood)
router.put("/update-food/:id", authGuardAdmin, foodController.updateFood)
router.delete("/delete-food/:id", authGuardAdmin, foodController.deleteFood)
router.get("/search", foodController.getSearchedFood)

module.exports = router;