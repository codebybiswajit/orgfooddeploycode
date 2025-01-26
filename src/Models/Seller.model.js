import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const sellerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: [true, 'Should be in Lower Case'],
        },
        password: { type: String, required: true },
        phoneNumber: { type: String },
        address: { type: String },
        role: {
            type: String,
            enum: ['seller', 'buyer', 'admin'],
            default: 'buyer',
        },
    },
    { timestamps: true }
)

sellerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = bcrypt.hash(this.password, 10)
    next()
})

sellerSchema.methods.isPasswordCorrcet = async function (password) {
    return await bcrypt.compare(password, this.password)
}

sellerSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            password: this.password,
            email: this.email,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
sellerSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            password: this.password,
            email: this.email,
            name: this.name,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const Seller = mongoose.model('Seller', sellerSchema)
