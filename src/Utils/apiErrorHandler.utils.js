class apiErrorHandler extends Error {
    constructor(
        statuscode,
        message = 'Something Went Wrong from Our Side',
        error = [],
        stack = ''
    ) {
        super(message)
        this.statuscode = statuscode
        this.message = message
        this.data = null
        this.success = false
        this.error = error

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { apiErrorHandler }
