import { Product } from '../Models/Product.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadincloud } from '../utils/Cloudnarry.utils.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { apiErrorHandler } from '../utils/apiErrorHandler.utils.js'
const AddProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, stockQuantity, imageLink } =
        req.body

    if (!name || !price || !category || !stockQuantity) {
        throw new apiErrorHandler(400, 'All fields are mandatory')
    }

    let imageUrl
    if (req.file) {
        // Handle file upload to Cloudinary
        const imageUrlLocalPath = req.file.path
        const imageUrlref = await uploadincloud(imageUrlLocalPath)
        if (!imageUrlref.url) {
            throw new apiErrorHandler(
                400,
                'Error while uploading image to Cloudinary'
            )
        }
        imageUrl = imageUrlref.url
    } else if (imageLink) {
        // Use the provided image link
        imageUrl = imageLink
    } else {
        throw new apiErrorHandler(400, 'Image is required')
    }

    const product = new Product({
        name,
        description,
        price,
        category,
        stockQuantity,
        imageUrl,
        userId: req.user._id, // Get user ID from authenticated user
    })

    try {
        const newProduct = await product.save()
        const findProduct = await Product.findById(newProduct._id).select(
            '-userId'
        )
        if (!findProduct) {
            throw new apiErrorHandler(
                500,
                'Something went wrong while adding the product'
            )
        }
        return res
            .status(201)
            .json(
                new ApiResponse(200, findProduct, 'Product added successfully')
            )
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

const getProductsByUser = asyncHandler(async (req, res) => {
    const userId = req.user._id
    // console.log(userId)
    try {
        const products = await Product.find({ userId })
        if (products.length === 0) {
            throw new apiErrorHandler(200, " You Haven't added any product")
        }
        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})
const updateProductDetails = asyncHandler(async (req, res) => {
    const { name, description, price, category, stockQuantity, imageLink } =
        req.body

    let updateFields = {}
    if (name) updateFields.name = name
    if (description) updateFields.description = description
    if (price) updateFields.price = price
    if (category) updateFields.category = category
    if (stockQuantity) updateFields.stockQuantity = stockQuantity

    let imageUrl
    if (req.file) {
        const imageUrlLocalPath = req.file.path
        const imageUrlref = await uploadincloud(imageUrlLocalPath)
        if (!imageUrlref.url) {
            throw new apiErrorHandler(
                400,
                'Error while uploading image to Cloudinary'
            )
        }
        imageUrl = imageUrlref.url
    } else if (imageLink) {
        imageUrl = imageLink
    }

    if (imageUrl) {
        updateFields.imageUrl = imageUrl
    }

    const { productId } = req.params
    try {
        const product = await Product.findByIdAndUpdate(
            productId,
            { $set: updateFields },
            { new: true }
        )

        if (!product) {
            throw new apiErrorHandler(404, 'Product not found')
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    product,
                    'Product details updated successfully'
                )
            )
    } catch (err) {
        throw new apiErrorHandler(400, err.message)
    }
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const response = await Product.findByIdAndDelete(productId)
    if (!response) {
        throw apiErrorHandler(500, 'Internal Serve Error')
    }
    res.status(200).json(
        new ApiResponse(200, response, 'Product Delected Successfully')
    )
})

const allProduct = asyncHandler(async (req, res) => {
    const allproduct = await Product.find()
    if (allproduct.length === 0) {
        throw apiErrorHandler(500, 'No Products Found')
    }
    res.status(200).json(
        new ApiResponse(200, allproduct, 'Products fetched successfully')
    )
})

const productByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params
    const decodedCategory = decodeURIComponent(category)
    const products = await Product.find({ category: decodedCategory })

    if (products.length === 0) {
        return res.status(404).json({ message: `No ${decodedCategory} found` })
    }

    res.status(200).json(
        new ApiResponse(
            200,
            products,
            `Products fetched successfully based on ${decodedCategory}`
        )
    )
})

export {
    AddProduct,
    getProductsByUser,
    updateProductDetails,
    deleteProduct,
    allProduct,
    productByCategory,
}
