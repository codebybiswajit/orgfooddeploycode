import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { checkAuth } from './Middlewares/CheackAuth.middleware.js'
import { apiErrorHandler } from './utils/apiErrorHandler.utils.js'
import UserRoute from './Routes/user.routes.js'
import ProductRoute from './Routes/product.routes.js'
import CartRoute from './Routes/cart.routes.js'
import AdminRoute from './Routes/admin.routes.js'
import 'dotenv/config'
import ContactRoutes from './Routes/contact.routes.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
const whiteListing = process.env.CORS_WHITELIST.split(',')

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || whiteListing.indexOf(origin) !== -1) {
                callback(null, origin) // Allow the request
            } else {
                callback(new Error('Not allowed by CORS')) // Reject the request
            }
        },
        credentials: true,
    })
)

app.get('/api/copyright', (req, res) => {
    res.send(`Org Food all rights reserved || by Biswajit Mohapatra`)
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// API Routes
app.use('/api/v0/users', UserRoute)
app.use('/api/v0/product', ProductRoute)
app.use('/api/v0/cart', CartRoute)
app.use('/api/admin', AdminRoute)
app.use('/api/feedback', ContactRoutes)

// app.use(express.static('dist'))
// at the time of deployment
app.use(express.static('dist'))

// Catch-all route to serve index.html for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})
// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof apiErrorHandler) {
        res.status(err.statuscode).json({
            success: err.success,
            message: err.message,
            error: err.error,
        })
    } else {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: err.message,
        })
    }
})

export { app }
