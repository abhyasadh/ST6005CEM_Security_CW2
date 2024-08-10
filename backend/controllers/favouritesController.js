const Favourites = require("../model/favouritesModel");

const getFavourites = async (req, res) => {
    const userId = req.params.userId;
    try {
        const favourites = await (Favourites.findOne({userId: userId})).populate('foodItems');
        if (!favourites) {
            return res.status(200).json({
                success: true,
                message: 'No favourites found!',
                foods: []
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Favourites fetched successfully!",
                foods: favourites.foodItems
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

const addToFavourites = async (req, res) => {
    const userId = req.params.userId;
    const {foodId} = req.body;

    try {
        const favourites = await Favourites.findOne({userId: userId});
        if (!favourites) {
            const newFavourites = new Favourites({
                userId : userId,
                foodItems: [foodId]
            });
    
            await newFavourites.save();
            res.status(200).json({
                success: true,
                message: "Favourite food added successfully!",
            })
        } else {
            favourites.foodItems.push(foodId);
            await favourites.save();
            res.status(200).json({
                success: true,
                message: "Favourite food added successfully!",
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error!'
        });
    }
}

const removeFromFavourites = async (req, res) => {
    const userId = req.params.userId;
    const {foodId} = req.body;

    try {
        const favourites = await Favourites.findOne({userId: userId});

        if (!favourites) {
            return res.json({
                success: false,
                message: 'Favourite list not found!'
            });
        } else {
            await Favourites.updateOne({ userId: userId },
                {$pull: { foodItems: foodId } },
              );
              return res.json({
                success: true,
                message: 'Food removed from favourite!'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error!'
        });
    }
}

module.exports = {
    addToFavourites, getFavourites, removeFromFavourites
}