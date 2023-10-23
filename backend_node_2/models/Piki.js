const mdbConn = require('../db/mariaDBPiki.js');


/****************************************************************************/
let user_statics_data_;
function user_statics_update(data){ 
    mdbConn.user_statics_update().then((faat)=>{
        user_statics_data_ = faat.map((value,index)=>{
            return({
                name:value.user,
                counter:value.c_user,
                key:value.key
            })
        })
    })
}
function user_statics_data(data){ 
    return user_statics_data_
}
setInterval(()=>{ user_statics_update(), console.log("user_statics_update") },2000); 
user_statics_update();


/****************************************************************************/
function users(data,next){ 
    mdbConn.users({
        user:data.id,
        page:data.page
    }).then((faat)=>{
        let fffff = faat.map((value,index)=>{return value})
        next(fffff);
    })
}


/****************************************************************************/
function post(data,next){ 
    mdbConn.post({
        id:Number(data.id)
    }).then((faat)=>{
        let fffff = faat
        next(fffff);
    })
}


module.exports = { 
    user_statics_data,
    users,
    post
}