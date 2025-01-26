import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { apiErrorHandler } from '../utils/apiErrorHandler.utils.js'
import { Contact } from '../Models/Contact.model.js'

const giveFeedback = asyncHandler(async (req, res) => {
    const { name, email, phoneNo, subject, message } = req.body
    try {
        const contactDetails = await Contact.create({
            name,
            email,
            phoneNo,
            subject,
            message,
        })

        res.json(
            new ApiResponse(
                200,
                {},
                'Contact details sent successfully ,we will contact you latter'
            )
        )
    } catch (error) {
        console.error('Error creating contact details:', error)
        throw new apiErrorHandler(400, "Can't Send. Internal Server Error")
    }
})

const getFeedback = asyncHandler(async (req, res) => {
    const feedbackData = await Contact.find()
    if (feedbackData.length === 0) {
        throw new apiErrorHandler(400, ' No Feedback found ')
    }
    res.json(
        new ApiResponse(200, feedbackData, 'Feedback Fetched Success fully')
    )
})

const deleteFeedback = asyncHandler(async (req, res) => {
    try {
        const feedback = await Contact.findByIdAndDelete(req.params.id)
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' })
        }
        res.json({ message: 'One Feedback deleted Successfully' })
    } catch (error) {
        console.error('Error deleting feedback:', error)
        res.status(500).json({ message: 'Failed to delete feedback' })
    }
})
export { giveFeedback, getFeedback, deleteFeedback }
