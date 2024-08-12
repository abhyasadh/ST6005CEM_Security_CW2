const express = require('express');
const router = express.Router();
const favouritesController = require("../controllers/favouritesController");

// Handler for method not allowed
function methodNotAllowed(req, res) {
    res.status(405).json({ message: "Method Not Allowed" });
}

router.route("/add-to-favourites/:userId")
    .put(favouritesController.addToFavourites)
    .all(methodNotAllowed);

router.route("/get-favourites/:userId")
    .get(favouritesController.getFavourites)
    .all(methodNotAllowed);

router.route("/remove-from-favourites/:userId")
    .put(favouritesController.removeFromFavourites)
    .all(methodNotAllowed);

module.exports = router;
