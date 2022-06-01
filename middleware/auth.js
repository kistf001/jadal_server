const User = require('../models/User');

let auth = (req, res, next) => {

    ////인증 처리를 하는곳 
    ////클라이언트 쿠키에서 토큰을 가져온다.

    let token = req.cookies.x_auth;

    User.findByToken(token, (err, value) => {

        if(err){
            return res.cookie("x_auth", "").json({ isAuth: false, error: true })
        }

        else{
            req.token = token;
            req.user = value;
            next()
        }

    })

}

let auth2 = (req, res, next) => {

    ////인증 처리를 하는곳 
    ////클라이언트 쿠키에서 토큰을 가져온다.

    let token = req.cookies.x_auth;

    User.findByToken(token, (err, value) => {

        if(err){
            req.token = null;
            req.user = null;
            req.cheack = false;
            next()
        }

        else{
            req.token = token;
            req.user = value;
            req.cheack = true;
            next()
        }

    })

}


module.exports = { auth,auth2 };