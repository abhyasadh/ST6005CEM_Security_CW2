const Categories = require("../model/categoryModel");
const cloudinary = require("cloudinary")

const createCategory = async (req, res) => {

    const {categoryName} = req.body
    const {categoryImage} = req.files;

    if (!categoryName || !categoryImage){
        return res.json({
            success: false,
            message: "Please fill all fields!"
        })
    }

    try {
        const uploadedImage = await cloudinary.v2.uploader.upload(
            categoryImage.path,{
                folder: "Categories",
                crop: "scale"
            }
        )

        const newCategory = new Categories({
            categoryName : categoryName,
            categoryImageUrl: uploadedImage.secure_url
        });

        await newCategory.save();
        res.status(200).json({
            success: true,
            message: "Category added successfully!",
            data: newCategory
        })
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

const getAllCategory = async (req, res) => {
    try {
        const listOfCategories = await (Categories.find({}));
        res.json({
            success: true,
            message: "Categories fetched successfully!",
            categories: listOfCategories
        })
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error")
    }
}

const unavailableCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const category = await Categories.findById(categoryId);

        if (!category) {
            return res.json({
                success: false,
                message: 'Category not found!'
            });
        }

        const currentStatus = category.status;
        
        category.status = !category.status;
        const updatedCategory = await category.save();

        if (currentStatus) {
        res.json({
            success: true,
            message: `${category.categoryName} is now unavailable!`,
            category: updatedCategory
        });
    } else { 
        res.json({
            success: true,
            message: `${category.categoryName} is now available!`,
            category: updatedCategory
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

const updateCategory = async (req, res) => {
    const id = req.params.id
    if (!id){
        return res.json({
            success: false,
            message: "Category Id is required!"
        })
    }

    if (!categoryName){
        return res.json({
            success: false,
            message: "Please fill all fields."
        })
    }

    try{
        if (categoryImage){
            const uploadedImage = await cloudinary.v2.uploader.upload(
                categoryImage.path,{
                    folder: "Categories",
                    crop: "scale"
                }
            )
            const updatedCategory = await Categories.findByIdAndUpdate(id, {
                categoryName : categoryName,
                categoryImageUrl: uploadedImage.secure_url
            })
            res.status(200).json({
                success: true,
                message: "Category updated successfully!",
                data: updatedCategory
            })
        } else {
            const updatedCategory = await Categories.findByIdAndUpdate(id, {
                categoryName : categoryName,
            })
            res.status(200).json({
                success: true,
                message: "Category updated successfully!",
                data: updatedCategory
            })
        }
    } catch (error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })        
    }
}

const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Categories.findByIdAndDelete(req.params.id);
        await cloudinary.v2.uploader.destroy(deletedCategory.categoryImageUrl);
        if (!deletedCategory){
            return res.status(404).json({
                success: false,
                message: "Category not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

module.exports = {
    createCategory, getAllCategory, unavailableCategory, updateCategory, deleteCategory
}