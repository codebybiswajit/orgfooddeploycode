import nodemailer from 'nodemailer'
import 'dotenv/config'
// for deployment

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    secure: true,
})
// console.log(process.env.EMAIL_USER)
// console.log(process.env.EMAIL_PASS)
// console.log(process.env.EMAIL_MAIL)
async function mailSender({
    to,
    name,
    subject = 'default Subject',
    text = 'Welcome',
    html = '<></>',
}) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER, // sender address
        to,
        subject,
        text,
        html,
    })

    // console.log('Message sent: %s', info.messageId)
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}
//

export { mailSender }
