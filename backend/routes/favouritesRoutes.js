const router = require('express').Router();
const favouritesController = require("../controllers/favouritesController");

router.put("/add-to-favourites/:userId", favouritesController.addToFavourites)
router.get("/get-favourites/:userId", favouritesController.getFavourites)
router.put("/remove-from-favourites/:userId", favouritesController.removeFromFavourites)

module.exports = router;