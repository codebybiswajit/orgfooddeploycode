import connectDB from './DB/index.js'
import { app } from './App.js'
import 'dotenv/config'
import 'cors'
const PORT = process.env.PORT || 4000

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listeining at port No ${PORT}`)
        })
    })
    .catch((error) => {
        throw error
        console.log('Mongoose Connection Fail')
    })
