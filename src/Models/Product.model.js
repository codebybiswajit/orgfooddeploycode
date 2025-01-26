import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: String, required: true },
        category: { type: String, required: true },
        stockQuantity: { type: String, required: true },
        imageUrl: { type: String },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
