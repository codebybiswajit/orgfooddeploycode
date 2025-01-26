import { Router } from 'express'
import {
    AddToCart,
    getCartItems,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    QuantityChange,
} from '../Controllers/cart.controller.js'
import { verifyJWT } from '../Middlewares/Authentication.middleware.js'
const router = Router()

router.post('/addtocart/:productId', verifyJWT, AddToCart)
router.get('/getcartItems', verifyJWT, getCartItems)
router.put('/increment/:productId', verifyJWT, incrementQuantity)
router.put('/decrement/:productId', verifyJWT, decrementQuantity)
router.delete('/remove-item/:productId', verifyJWT, removeFromCart)
router.put('/update/:productId', verifyJWT, QuantityChange)

export default router
