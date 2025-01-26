import { Router } from 'express'
import { upload } from '../Middlewares/multer.middleware.js'
import { verifyJWT } from '../Middlewares/Authentication.middleware.js'
import {
    AddProduct,
    getProductsByUser,
    updateProductDetails,
    deleteProduct,
    allProduct,
    productByCategory,
} from '../Controllers/Product.controller.js'

const routes = Router()
routes
    .route('/addproduct')
    .post(verifyJWT, upload.single('imageUrl'), AddProduct)
routes.get('/seller-products', verifyJWT, getProductsByUser) // Ensure correct file upload setup
routes.put(
    '/update/:productId',
    upload.single('imageUrl'),
    updateProductDetails
)
routes.post('/delete/:productId', deleteProduct)
routes.get('/allproducts', allProduct)
routes.get('/products-by-category/:category', productByCategory)

export default routes
