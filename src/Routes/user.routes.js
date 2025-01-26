import { Router } from 'express'
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    removeUser,
    resetPassword,
    updateAccountDetails,
} from '../Controllers/User.controller.js'
import { upload } from '../Middlewares/multer.middleware.js'
import { verifyJWT } from '../Middlewares/Authentication.middleware.js'

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1,
        },
        
        // multiple Object can be introduced according to our requirement
    ]),
    registerUser
)
router.route('/login').post(loginUser)
router.get('/profile', verifyJWT, getCurrentUser)

// router to update user profile
//secured routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/remove').post(verifyJWT, removeUser)
router.route('/update_user').post(verifyJWT, updateAccountDetails)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router
    .route('/avatar')
    .patch(verifyJWT, upload.single('avatar'), updateUserAvatar)
router.post('/reset-password', resetPassword)

export default router
