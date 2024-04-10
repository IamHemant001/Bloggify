const { validateToken } = require("../services/authentication");

function checkAuthenticationCookie(cookieName){
    return (req,res,next) =>{
        const tokenValue = req.cookies[cookieName];
        if(!tokenValue){
            return next();
        }else{
            try{
                const userPayload = validateToken(tokenValue);
                req.user = userPayload;
                next();
            }catch(err){
                return next();
            }
            
        }
    }

}

module.exports = checkAuthenticationCookie;