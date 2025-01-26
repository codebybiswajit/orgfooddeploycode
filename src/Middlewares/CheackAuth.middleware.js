const checkAuth = (req, res, next) => {
    const token = req.cookies['accessToken'] // Read the HttpOnly cookie
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' })
    }

    // Verify token logic here (e.g., JWT verification)

    const payload = jwt.verify(token, 'your-secret-key')
    if (!payload) {
        return res.status(401).json({ message: 'Invalid token' })
    }

    if (payload.exp < Date.now() / 1000) {
        return res.status(401).json({ message: 'Token expired' })
    }

    next()
}
export { checkAuth }
