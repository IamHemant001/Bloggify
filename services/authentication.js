const JWT = require('jsonwebtoken');

const scret = "Superman123@";

function createTokenForUser(user){

    const payload = {
        _id : user._id,
        email : user.email,
        profile_img : user.profile,
        role : user.role
    }

    const token = JWT.sign(payload,scret);
    return token;
}


function validateToken(token){
    const payload = JWT.verify(token,scret);
    return payload;
}


module.exports = {
    createTokenForUser,
    validateToken
}