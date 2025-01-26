import express from 'express'
const app = express()
const ErrhandlerJson = app.use((err, req, res, next) => {
    if (err instanceof apiErrorHandler) {
        res.status(err.statuscode).json({
            success: err.success,
            message: err.message,
            error: err.error,
        })
    } else {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: err.message,
        })
    }
})

export { ErrhandlerJson }
