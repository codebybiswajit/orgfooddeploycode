// import { mailSender } from './Mail.controller.js';
import { mailSender } from '../Utils/Mail.utils.js'
import { apiErrorHandler } from '../utils/apiErrorHandler.utils.js'
const sendMailMiddleware = ({ action, email, name }) => {
    let subject
    let text
    let html

    switch (action) {
        case 'register':
            subject =
                "Welcome to India's Largest Organic Food Verified Seller Family!"
            text = `Dear ${name},

            We are thrilled to welcome you to the India’s Largest Organic Food Verified Seller community! Your registration was successful, and we’re excited to have you on board.

            At [Your Company Name], we pride ourselves on providing the highest quality organic products straight from the farm to your doorstep. As a valued member, you’ll enjoy exclusive access to our freshest produce, special member-only discounts, and updates on the latest arrivals and promotions.

            Thank you for choosing us as your trusted source for organic food. If you have any questions or need assistance, our customer service team is always here to help.

            Here's to healthy and happy eating!

            Best regards,
            The Org Food Team`
            html = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Registration Success</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                width: 80%;
                                margin: auto;
                                padding: 20px;
                            }
                            .header {
                                background-color: #f4f4f4;
                                padding: 10px 20px;
                                border-bottom: 1px solid #ddd;
                                margin-bottom: 20px;
                            }
                            .footer {
                                background-color: #f4f4f4;
                                padding: 10px 20px;
                                border-top: 1px solid #ddd;
                                margin-top: 20px;
                            }
                            .button {
                                display: inline-block;
                                padding: 10px 20px;
                                font-size: 16px;
                                color: #fff;
                                background-color: #28a745;
                                text-decoration: none;
                                border-radius: 5px;
                            }
                            .button:hover {
                                background-color: #218838;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Welcome to India's Largest Organic Food Verified Seller Family!</h1>
                            </div>
                            <p>Dear ${name},</p>
                            <p>
                                We are thrilled to welcome you to the India’s Largest Organic Food Verified Seller community! Your registration was successful, and we’re excited to have you on board.
                            </p>
                            <p>
                                At <strong>ORG FOOD</strong>, we pride ourselves on providing the highest quality organic products straight from the farm to your doorstep. As a valued member, you’ll enjoy exclusive access to our freshest produce, special member-only discounts, and updates on the latest arrivals and promotions.
                            </p>
                            <p>
                                Thank you for choosing us as your trusted source for organic food. If you have any questions or need assistance, our customer service team is always here to help.
                            </p>
                            <p>Here's to healthy and happy eating!</p>
                            <p>Best regards,</p>
                            <p><strong>The Org Food Team</strong></p>
                        </div>
                    </body>
                    </html>`
            break

        case 'login':
            subject = 'Successful Login Notification'
            text = `Dear ${name},
            We noticed a successful login to your account. If this was not you, please contact our support immediately.

            Best regards,
            The Org Food Team`
            html = `<p>Dear ${name},</p>
                    <p>We noticed a successful login to your account. If this was not you, please contact our support immediately.</p>
                    <p>Best regards,</p>
                    <p><strong>The Org Food Team</strong></p>`
            break

        // Add more cases as needed

        default:
            return next() // If action is not recognized, move to the next middleware
    }

    mailSender({ to: email, name: name, subject, text, html })
}

export { sendMailMiddleware }
