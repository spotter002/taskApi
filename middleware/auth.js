const jwt = require('jsonwebtoken')
// load the sectret key used to verify tokens from .env file
const JWT_SECRET = process.env.JWT_SECRET

// create a function for the middleware
function auth(req,res,next){
    // get the authorization header from the incoming request
    const authHeader = req.headers.authorization
    console.log("authHeader",authHeader)
    
    // extraxct the token from the authHeader
    const token = authHeader && authHeader.split(' ')[1] // split the header to get the token
    // console.log("token",token)
    if(!token){
        return res.status(401).json({message:"Access denied, no token provided"})
    }
    try {
        // verify the token using the secret key
        // if the token is valid, it will return the decoded user information and store in req.user
        const decoded = jwt.verify(token, JWT_SECRET)
        console.log("decoded",decoded)
        // attach the decoded user information to the request object
        req.user = decoded // store the decoded user information in req.user
        // allow the request to proceed to the next middleware or route handler
        next()
    } catch (error) {
        return res.status(400).json({message:"Invalid token"})
    }
}
module.exports = auth // export the auth middleware function

