const Categories = require("../model/categoryModel");
const cloudinary = require("cloudinary")
const fileType = require("file-type");

const createCategory = async (req, res) => {
    const { categoryName } = req.body;
    const { categoryImage } = req.files;

    if (!categoryName || !categoryImage) {
        return res.json({
            success: false,
            message: "Please fill all fields!"
        });
    }

    try {
        const mimeInfo = categoryImage.mimetype;

        if (!mimeInfo || !mimeInfo.mime.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type. Please upload an image."
            });
        }

        const uploadedImage = await cloudinary.v2.uploader.upload(
            categoryImage.path, {
                folder: "Categories",
                crop: "scale"
            }
        );

        const newCategory = new Categories({
            categoryName: categoryName,
            categoryImageUrl: uploadedImage.secure_url
        });

        await newCategory.save();
        res.status(200).json({
            success: true,
            message: "Category added successfully!",
            data: newCategory
        });
    } catch (error) {
        console.log(error);
        res.status(500).json("Server Error");
    }
};

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
    const id = req.params.id;
    const { categoryName } = req.body;
    const { categoryImage } = req.files;

    if (!id) {
        return res.json({
            success: false,
            message: "Category Id is required!"
        });
    }

    if (!categoryName) {
        return res.json({
            success: false,
            message: "Please fill all fields."
        });
    }

    try {
        let updatedCategory;

        if (categoryImage) {
            const fileBuffer = fs.readFileSync(categoryImage.path);
            const mimeInfo = await fileType.fromBuffer(fileBuffer);

            if (!mimeInfo || !mimeInfo.mime.startsWith('image/')) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid file type. Please upload an image."
                });
            }

            const uploadedImage = await cloudinary.v2.uploader.upload(
                categoryImage.path, {
                    folder: "Categories",
                    crop: "scale"
                }
            );

            updatedCategory = await Categories.findByIdAndUpdate(id, {
                categoryName: categoryName,
                categoryImageUrl: uploadedImage.secure_url
            });
        } else {
            updatedCategory = await Categories.findByIdAndUpdate(id, {
                categoryName: categoryName,
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully!",
            data: updatedCategory
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Categories.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Extract public ID from the Cloudinary URL to delete the image
        const publicId = deletedCategory.categoryImageUrl.split('/').pop().split('.')[0];
        await cloudinary.v2.uploader.destroy(`Categories/${publicId}`);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    createCategory, getAllCategory, unavailableCategory, updateCategory, deleteCategory
}