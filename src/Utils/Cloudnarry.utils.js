import { v2 } from 'cloudinary'
import fs from 'fs'
import 'dotenv/config'

v2.config({
    cloud_name: `${process.env.CLOUD_NAME}`,
    api_key: `${process.env.CLOUDINARY_API_KEY}`,
    api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
    secure: true,
})

const uploadincloud = async (localFilePath) => {
    // console.log(process.env.v2_API_KEY)
    // console.log(process.env.v2_API_SECRET )
    try {
        console.log(localFilePath)
        if (localFilePath) {
            //upload the file on v2
            const response = await v2.uploader.upload(localFilePath, {
                resource_type: 'auto',
            })
            console.log(localFilePath)
            // file has been uploaded successfull
            //console.log("file is uploaded on v2 ", response.url);
            fs.unlinkSync(localFilePath)
            // console.log(response)
            return response
        } else return null
    } catch (error) {
        console.log(error, 'Error While Uploading')
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

export { uploadincloud }
