const Foods = require("../model/foodModel");
const cloudinary = require("cloudinary");
const fileType = require("file-type");

const createFood = async (req, res) => {
    const { foodName, foodPrice, foodTime, foodCategory } = req.body;
    const { foodImage } = req.files;

    if (!foodName || !foodPrice || !foodTime || !foodCategory || !foodImage) {
        return res.json({
            success: false,
            message: "Please fill all fields!"
        });
    }

    try {
        const fileBuffer = fs.readFileSync(foodImage.path);
        const mimeInfo = await fileType.fromBuffer(fileBuffer);

        if (!mimeInfo || !mimeInfo.mime.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type. Please upload an image."
            });
        }

        const uploadedImage = await cloudinary.v2.uploader.upload(
            foodImage.path, {
                folder: "Foods",
                crop: "scale"
            }
        );

        const newFood = new Foods({
            foodName: foodName,
            foodPrice: foodPrice,
            foodTime: foodTime,
            foodCategory: foodCategory,
            foodImageUrl: uploadedImage.secure_url
        });

        await newFood.save();
        res.status(200).json({
            success: true,
            message: "Food added successfully!",
            data: newFood
        });
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error");
    }
};

const getAllFood = async (req, res) => {
    try {
        const listOfFoods = await (Foods.find({}));
        res.status(200).json({
            success: true,
            message: "Foods fetched successfully!",
            foods: listOfFoods
        })
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

const getSelectedFood = async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const listOfFoods = await (Foods.find({foodCategory: categoryId, status: true}));
        res.status(200).json({
            success: true,
            message: "Foods fetched successfully!",
            foods: listOfFoods
        })
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

const unavailableFood = async (req, res) => {
    const foodId = req.params.id;

    try {
        const food = await Foods.findById(foodId);

        if (!food) {
            return res.json({
                success: false,
                message: 'Food not found!'
            });
        }

        const currentStatus = food.status;
        
        food.status = !food.status;
        const updatedFood = await food.save();

        if (currentStatus) {
        res.json({
            success: true,
            message: `${food.foodName} is now unavailable!`,
            food: updatedFood
        });
    } else { 
        res.json({
            success: true,
            message: `${food.foodName} is now available!`,
            food: updatedFood
        });
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}

const updateFood = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.json({
            success: false,
            message: "Food Id is required!"
        });
    }

    const { foodName, foodPrice, foodTime, foodCategory } = req.body;
    const { foodImage } = req.files;

    if ((!foodName || !foodPrice || !foodTime || !foodCategory)) {
        return res.json({
            success: false,
            message: "Please fill all fields!"
        });
    }

    try {
        let updatedFood;

        if (foodImage) {
            const fileBuffer = fs.readFileSync(foodImage.path);
            const mimeInfo = await fileType.fromBuffer(fileBuffer);

            if (!mimeInfo || !mimeInfo.mime.startsWith('image/')) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid file type. Please upload an image."
                });
            }

            const uploadedImage = await cloudinary.v2.uploader.upload(
                foodImage.path, {
                    folder: "Foods",
                    crop: "scale"
                }
            );

            updatedFood = await Foods.findByIdAndUpdate(id, {
                foodName: foodName,
                foodPrice: foodPrice,
                foodTime: foodTime,
                foodCategory: foodCategory,
                foodImageUrl: uploadedImage.secure_url
            });
        } else {
            updatedFood = await Foods.findByIdAndUpdate(id, {
                foodName: foodName,
                foodPrice: foodPrice,
                foodTime: foodTime,
                foodCategory: foodCategory,
            });
        }

        res.status(200).json({
            success: true,
            message: "Food updated successfully!",
            data: updatedFood
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const deleteFood = async (req, res) => {
    try {
        const deletedFood = await Foods.findByIdAndDelete(req.params.id);
        await cloudinary.v2.uploader.destroy(deletedFood.foodImageUrl)
        if (!deletedFood){
            return res.status(404).json({
                success: false,
                message: "Food not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Food deleted successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

const getSearchedFood = async (req, res) => {
    try {
        const query = req.query.q;

        const searchResults = await Foods.find({
      $or: [
        { foodName: { $regex: query, $options: 'i' } },
      ]
    });

        res.status(200).json({
            success: true,
            message: "Foods fetched successfully!",
            foods: searchResults
        })
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

module.exports = {
    createFood, getAllFood, getSelectedFood, unavailableFood, updateFood, deleteFood, getSearchedFood
}