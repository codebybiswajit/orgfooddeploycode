import {
    giveFeedback,
    getFeedback,
    deleteFeedback,
} from '../Controllers/contact.controller.js'
import { Router } from 'express'
import cookieParser from 'cookie-parser'
import { Contact } from '../Models/Contact.model.js'
import { checkAdmin } from '../Middlewares/isAdmin.middleware.js'
import { verifyJWT } from '../Middlewares/Authentication.middleware.js'
const routes = Router()

routes.post('/contactus', giveFeedback)
routes.get('/allfeedback', verifyJWT, checkAdmin, getFeedback)
routes.delete('/:id', verifyJWT, checkAdmin, deleteFeedback)

export default routes
