import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { upload } from '../Middlewares/multer.middleware.js'
import { sendMailMiddleware } from '../Middlewares/Email.middleware.js'
import { User } from '../Models/User.model.js'
import { apiErrorHandler } from '../utils/apiErrorHandler.utils.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadincloud } from '../utils/Cloudnarry.utils.js'
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiErrorHandler(
            500,
            'Something went wrong while generating referesh and access token'
        )
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message : 'data Recieved'
    // })

    //steps for registering user
    // Collect data From Frontend
    // //console.log(req.files)
    const { name, email, password, phoneNumber, address, role } = req.body

    // for cheacking if we are getting the data or not
    // console.log(`\nname : ${name}\npassword : ${password}\nphoneNumber : ${phoneNumber}\naddress : ${address}\nemail : ${email} `)
    // Checking Or validating if the fields are empty or not
    if (
        [name, email, password, phoneNumber, address].some(
            (field) => field?.trim() === ''
        )
    ) {
        throw new apiErrorHandler(400, 'All fields Are Required')
    }
    // Cheacking If Phone Number is Of ten digit or not
    if (phoneNumber.trim().length !== 10) {
        throw new apiErrorHandler(400, 'Phone Number Must be of ten digits')
    }
    // cheacking if the user existed or not
    const existedUser = await User.findOne({
        $or: [{ email }, { phoneNumber }],
    })
    // console.log(existedUser)
    // if user exist give the feed back
    if (existedUser) throw new apiErrorHandler(409, 'User Already Exist')
    // Getting the avatar path from local path provide by multer
    // Get avatar path
    const avatarpath = req.files?.avatar ? req.files.avatar[0].path : null
    // Upload avatar to Cloudinary if it exists
    let uploadedref = {}
    if (avatarpath) {
        uploadedref = await uploadincloud(avatarpath)
    }
    //    Creating user database by sending entries
    const userDetails = await User.create({
        name: name[0].toUpperCase() + name.slice(1),
        email,
        password,
        phoneNumber,
        address,
        role,
        avatar: uploadedref.url || '',
    })
    //    finding User To Cheack If The User Already Exist or not or getting response from database
    const finduser = await User.findById(userDetails._id).select(
        '-password -refresh_token'
    )
    //    can use many as you want because it uses is  not to give these details directly from the  database to the user
    // if the user does exist then return error As this error occured from updating data from our side so the error code is between 500-600
    if (!finduser) {
        throw new apiErrorHandler(
            500,
            'Something went wrong while registering the error'
        )
    }
    sendMailMiddleware({
        action: 'register',
        email: email,
        name: name,
    })
    // Returning response as our database created by using these entries
    // console.log(finduser)
    return res
        .status(201)
        .json(new ApiResponse(200, finduser, 'User Register Success'))
})

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, password } = req.body
    // //console.log(email);

    if (!password && !email) {
        throw new apiErrorHandler(400, 'username or email is required')
    }

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new apiErrorHandler(400, "username or email is required")

    // }

    const user = await User.findOne({
        $or: [{ email }],
    })

    if (!user) {
        throw new apiErrorHandler(400, 'User does not exist')
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiErrorHandler(400, 'Incorrect Password')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    )

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )

    const options = {
        httpOnly: true,
        secure: false,
    }
    // console.log(loggedInUser.mail)
    sendMailMiddleware({
        action: 'login',
        email: loggedInUser.email,
        name: loggedInUser.name,
    })
    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                'User logged In Successfully'
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { refreshToken: 1 } }, // This removes the refreshToken field from the document
            { new: true }
        )

        const options = {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'Lax',
        }

        return res
            .status(200)
            .clearCookie('accessToken', options)
            .clearCookie('refreshToken', options)
            .json({ statusCode: 200, message: 'User logged out' })
    } catch (error) {
        console.error('Error deleting user:', error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
})

const removeUser = asyncHandler(async (req, res, next) => {
    const userId = req.user._id // Correctly extract userId from req.user

    try {
        const existUser = await User.findById(userId) // Find user by ID

        if (!existUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        await User.findByIdAndDelete(userId) // Delete user by ID

        const options = { httpOnly: true, secure: false, sameSite: 'Lax' } // Cookie options

        res.status(200)
            .clearCookie('accessToken', options)
            .clearCookie('refreshToken', options)
            .json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new apiErrorHandler(401, 'unauthorized request')
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new apiErrorHandler(401, 'Invalid refresh token')
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiErrorHandler(401, 'Refresh token is expired or used')
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    'Access token refreshed'
                )
            )
    } catch (error) {
        throw new apiErrorHandler(
            401,
            error?.message || 'Invalid refresh token'
        )
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiErrorHandler(400, 'Invalid old password')
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password changed successfully'))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, 'User fetched successfully'))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email, address, phoneNumber } = req.body
    // //console.log(name,email,address)
    if (!name || !email || !address) {
        throw new apiErrorHandler(400, 'All fields are required')
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name: name,
                email: email,
                address: address,
                phoneNumber: phoneNumber,
            },
        },
        { new: true }
    ).select('-password')

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, 'Account details updated successfully')
        )
})
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new apiErrorHandler(400, 'Avatar file is missing')
    }

    //TODO: delete old image - assignment

    const avatar = await uploadincloud(avatarLocalPath)
    // //console.log(avatar)

    if (!avatar.url) {
        throw new apiErrorHandler(400, 'Error while uploading on avatar')
    }

    //console.log(req.user?._id)
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select('-password')

    return res
        .status(200)
        .json(new ApiResponse(200, user, 'Avatar image updated successfully'))
})

const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        throw apiErrorHandler(400, "email id is incorrect or doesn't exist")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Password changed successfully'))
})
export {
    registerUser,
    loginUser,
    removeUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    resetPassword,
}
