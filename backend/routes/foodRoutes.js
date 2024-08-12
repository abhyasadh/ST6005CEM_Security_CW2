const express = require('express');
const router = express.Router();
const foodController = require("../controllers/foodController");
const { authGuardAdmin } = require('../middleware/authGuard');

// Handler for method not allowed
function methodNotAllowed(req, res) {
    res.status(405).json({ message: "Method Not Allowed" });
}

router.route("/create-food")
    .post(authGuardAdmin, foodController.createFood)
    .all(methodNotAllowed);

router.route("/get-foods")
    .get(foodController.getAllFood)
    .all(methodNotAllowed);

router.route("/get-selected/:categoryId")
    .get(foodController.getSelectedFood)
    .all(methodNotAllowed);

router.route("/unavailable/:id")
    .put(authGuardAdmin, foodController.unavailableFood)
    .all(methodNotAllowed);

router.route("/update-food/:id")
    .put(authGuardAdmin, foodController.updateFood)
    .all(methodNotAllowed);

router.route("/delete-food/:id")
    .delete(authGuardAdmin, foodController.deleteFood)
    .all(methodNotAllowed);

router.route("/search")
    .get(foodController.getSearchedFood)
    .all(methodNotAllowed);

module.exports = router;
