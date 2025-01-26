import { Router } from 'express'
import { verifyJWT } from '../Middlewares/Authentication.middleware.js'
import { checkAdmin } from '../Middlewares/isAdmin.middleware.js'
import { User } from '../Models/User.model.js'
import bcrypt from 'bcrypt'

const router = Router()

router.get('/users', verifyJWT, checkAdmin, async (req, res) => {
    const users = await User.find({})
    res.json(users)
})

router.delete('/user/:id', verifyJWT, checkAdmin, async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
})

router.put('/user/:id', async (req, res) => {
    const updates = req.body
    const options = { new: true } // Return the updated document
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            options
        )
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json({ message: 'User updated', user })
    } catch (error) {
        res.status(400).json({
            message: 'Error updating user',
            error: error.message,
        })
    }
})

router.put(
    '/api/admin/user/reset-password/:id',
    verifyJWT,
    checkAdmin,
    async (req, res) => {
        const { password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)

        try {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { password: hashedPassword },
                { new: true }
            )
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }
            res.json({ message: 'Password reset successfully', user })
        } catch (error) {
            res.status(400).json({
                message: 'Error resetting password',
                error: error.message,
            })
        }
    }
)

export default router
