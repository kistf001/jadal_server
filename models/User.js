const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mdbConn = require('../db/mariaDBConn.js');
const e = require('express');
const saltRounds = 10

function Save(){ 
    mdbConn.getUserList()
}
function Find(user,next){
    mdbConn
    .getUser(user["email"])
    .then((value) => {
        //console.log("=>>",value)
        if(value){
            next(0,1);
        }
        else{
            next(0,0);
        }
    })
}
function FindByToken(token,next){
    jwt.verify(token, 'secretToken', function (err, decoded) {
        let data = {
            key:decoded,
            token:token
        }
        mdbConn.getTokenByKeyAndToken(data).then((value) => {
            //console.log(value)
            if(value){
                next(null,value[0].key);
            }
            else{
                next(1,null);
            }
        })
    })
}
function GenToken(user,next){
    var token = jwt.sign(user['key'], 'secretToken')
    mdbConn.setToken(user,token).then((value) => {
        if(value){
            next(null,value);
        }
        else{
            next(1,null);
        }
    })
}
function Register(user,next){
    mdbConn.register(user).then((value) => {
        if(value){
            next(0,value);
        }
        else{
            next(1,1);
        }
    })
}
function Login(user,next){

    mdbConn.getEmail(user).then((value)=>{
        
        // 이메일이 확인됨
        if(value){

            mdbConn.getPwd(user).then((value)=>{
                
                // 비밀번호가 맞음
                if(value){

                    GenToken(value,(err,key)=>{

                        next(null,{
                            loginSuccess: false,
                            message: "로그인 성공",
                            token:key
                        })
                        
                    })

                }
                
                else{
                    next(1,{
                        loginSuccess: false,
                        message: "로그인 실패"
                    })
                }

            })

        }
        
        else{
        
            next(1,{
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        
        }

    })

}
function Logout(user,next){

    mdbConn.getEmail(user).then((value)=>{
        
        if(value){

            mdbConn.removeToken(user).then((value)=>{
                
                // 제대로 로그아웃 되었는지 확인한다.
                mdbConn.getToken(user).then((value)=>{
                    
                    if(value.token==""){
                        next(null,{
                            loginSuccess: true,
                            message: "로그아웃 완료"
                        });
                    }
                    
                    else{
                        next(1,{
                            loginSuccess: false,
                            message: "로그아웃 실패"
                        })
                    }

                })


            })

        }
        
        else{
        
            next(1,{
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        
        }

    })

}


module.exports = { 
    save:Save,
    find:Find,
    login:Login,
    genToken:GenToken,
    register:Register,
    logout:Logout,
    findByToken:FindByToken
}
