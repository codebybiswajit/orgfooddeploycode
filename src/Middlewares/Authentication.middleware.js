import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { User } from '../Models/User.model.js'
// import { asyncHandler } from "../Utils/asyncHandler.js";
import { asyncHandler } from '../utils/asyncHandler.js'
import { apiErrorHandler } from '../utils/apiErrorHandler.utils.js'
const cookies = cookieParser()
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header('Authorization')?.replace('Bearer ', '')
        if (!token) {
            throw new apiErrorHandler(401, 'Unauthorized request')
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(
            '-password -refreshToken'
        )

        if (!user) {
            throw new apiErrorHandler(401, 'Invalid Access Token')
        }

        req.user = user
        next()
    } catch (error) {
        throw new apiErrorHandler(401, error?.message || 'Invalid access token')
    }
})
