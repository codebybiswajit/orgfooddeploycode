import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import { model } from 'mongoose'
const ContactSchemma = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
    },
})

export const Contact = model('Contact', ContactSchemma)
