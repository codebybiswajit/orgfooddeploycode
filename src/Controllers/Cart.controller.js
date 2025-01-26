import { Cart } from '../Models/Cart.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Product } from '../Models/Product.model.js'
import { apiErrorHandler } from '../utils/apiErrorHandler.utils.js'

const AddToCart = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const product = await Product.findById(productId)
    const userId = req.user._id
    if (!product) {
        return res.status(404).json(apiErrorHandler(404, 'Product not found'))
    }

    let cart = await Cart.findOne({ userId })
    if (!cart) {
        cart = new Cart({ userId, items: [], totalPrice: 0 })
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
    )
    if (itemIndex > -1) {
        return res
            .status(200)
            .json(new ApiResponse(200, cart, 'Product already in cart'))
    } else {
        cart.items.push({ productId, price: product.price, quantity: 1 })
        cart.totalPrice = cart.items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        )
        await cart.save()
        return res
            .status(200)
            .json(
                new ApiResponse(200, cart, 'Product added to cart successfully')
            )
    }
})

const getCartItems = asyncHandler(async (req, res) => {
    const userId = req.user._id

    // Find the user's cart and populate the product details
    const cart = await Cart.findOne({ userId }).populate('items.productId')

    if (!cart) {
        return res
            .status(404)
            .json({ success: false, message: 'Cart not found' })
    }

    if (cart.items.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'Your cart is empty',
            data: {
                _id: cart._id,
                userId: cart.userId,
                items: [],
                imageUrl: '',
                productDescription: '',
                totalPrice: 0,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt,
                __v: cart.__v,
            },
        })
    }

    const items = cart.items.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.name, // Assuming product name is needed
        quantity: item.quantity,
        productDescription: item.productId.description,
        price: item.price,
        imageUrl: item.productId.imageUrl,
        total: item.price * item.quantity,
    }))

    res.status(200).json({
        statusCode: 200,
        data: {
            _id: cart._id,
            userId: cart.userId,
            items,
            totalPrice: cart.totalPrice,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
            __v: cart.__v,
        },
        message: 'Cart items fetched successfully',
        success: true,
    })
})

const incrementQuantity = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const userId = req.user._id

    let cart = await Cart.findOne({ userId }).populate('items.productId') // Ensure populate here
    if (!cart) {
        return res
            .status(404)
            .json({ success: false, message: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.productId._id.toString() === productId
    ) // Adjusted to use _id from populated product
    if (itemIndex === -1) {
        return res
            .status(404)
            .json({ success: false, message: 'Product not found in cart' })
    }

    cart.items[itemIndex].quantity += 1
    cart.items[itemIndex].price =
        cart.items[itemIndex].quantity * cart.items[itemIndex].productId.price // Ensure correct price reference
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0)

    await cart.save()
    res.status(200).json(
        new ApiResponse(200, cart, 'Product quantity incremented successfully')
    )
})

const decrementQuantity = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const userId = req.user._id

    let cart = await Cart.findOne({ userId }).populate('items.productId') // Ensure populate here
    if (!cart) {
        return res
            .status(404)
            .json({ success: false, message: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.productId._id.toString() === productId
    ) // Adjusted to use _id from populated product
    if (itemIndex === -1) {
        return res
            .status(404)
            .json({ success: false, message: 'Product not found in cart' })
    }

    if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1
        cart.items[itemIndex].price =
            cart.items[itemIndex].quantity *
            cart.items[itemIndex].productId.price // Ensure correct price reference
    } else {
        cart.items.splice(itemIndex, 1)
    }

    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0)

    await cart.save()
    res.status(200).json(
        new ApiResponse(200, cart, 'Product quantity decremented successfully')
    )
})

const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const userId = req.user._id

    let cart = await Cart.findOne({ userId }).populate('items.productId') // Ensure populate here
    if (!cart) {
        return res
            .status(404)
            .json({ success: false, message: 'Cart not found' })
    }

    cart.items = cart.items.filter(
        (item) => item.productId._id.toString() !== productId
    ) // Adjusted to use _id from populated product
    cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    )

    await cart.save()
    res.status(200).json(
        new ApiResponse(200, cart, 'Product removed from cart successfully')
    )
})

const QuantityChange = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const { quantity } = req.body // Get the new quantity from the request body
    const userId = req.user._id

    if (quantity < 1) {
        return res
            .status(400)
            .json({ success: false, message: 'Quantity must be at least 1' })
    }

    const product = await Product.findById(productId)
    if (!product) {
        return res.status(404).json(apiErrorHandler(404, 'Product not found'))
    }

    let cart = await Cart.findOne({ userId }).populate('items.productId')
    if (!cart) {
        return res.status(404).json(apiErrorHandler(404, 'Cart not found'))
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.productId._id.toString() === productId
    )
    if (itemIndex === -1) {
        return res.status(404).json(apiErrorHandler(404, 'Product not in cart'))
    }

    cart.items[itemIndex].quantity = quantity
    cart.items[itemIndex].price = quantity * product.price
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0)

    await cart.save()
    res.status(200).json(
        new ApiResponse(200, cart, 'Product quantity updated successfully')
    )
})

export {
    AddToCart,
    getCartItems,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    QuantityChange,
}
