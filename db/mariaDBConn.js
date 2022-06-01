const mariadb = require('mariadb'); 
const vals = require('../secreatData/consts.js'); 
const pool = mariadb.createPool({ 
    host: vals.DBHost, 
    port:vals.DBPort, 
    user: vals.DBUser, 
    password: vals.DBPass, 
    connectionLimit: 5 
}); 

console.log(pool,"\n\n=====mariaDB connected=====\n\n")

async function GetEmail(user){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            'SELECT `email` FROM `jadal`.`user` '+
            'WHERE `email`="'+user['email']+'"'+
            ';'
        );
    } 
    catch(err){ 
        throw err; 
    } 
    finally{ 
        if (conn) 
            conn.end(); 
        return rows[0]; 
    } 
}
async function GetPwd(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        //rows = await conn.query(
        //    'SELECT `email` FROM `jadal`.`user` WHERE `email`="'+email+'";'
        //);
        rows = await conn.query(
            'SELECT `key` FROM `jadal`.`user` '+
            'WHERE `email`="'+data["email"]+'" '+
            'AND `password`="'+data["password"]+'" '+
            '; '
        );
    } 
    catch(err){ 
        throw err; 
    } 
    finally{ 
        if (conn) 
            conn.end(); 
        return rows[0]; 
    } 
}
async function GetLogin(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            'SELECT `key` FROM `jadal`.`user` '+
            'WHERE `email`="'+data["email"]+'" '+
            'AND `password`="'+data["password"]+'" '+
            '; '
        );
    } 
    catch(err){ 
        throw err; 
    } 
    finally{ 
        if (conn) 
            conn.end(); 
        return rows[0]; 
    } 
}
async function GetToken(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            'SELECT `token` FROM `jadal`.`user` '+
            'WHERE `email`="'+data["email"]+
            '"; '
        );
    } 
    catch(err){ 
        throw err; 
    } 
    finally{ 
        if (conn) 
            conn.end(); 
        return rows[0]; 
    } 
}
async function GetTokenByKey(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            'SELECT `token` FROM `jadal`.`user` '+
            'WHERE `key`="'+data.key+
            '"; '
        );
    } 
    catch(err){ 
        throw err; 
    } 
    finally{ 
        if (conn) 
            conn.end(); 
        return rows[0]; 
    } 
}
async function GetTokenByKeyAndToken(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            'SELECT * FROM `jadal`.`user` '+
            'WHERE `key` = ? '+
            'AND `token` = ? '+
            '; ',
            [
                data.key,
                data.token
            ]
        );
    } 
    catch(err){ 
        throw err; 
    } 
    finally{ 
        if (conn) 
            conn.end(); 
        return rows; 
    } 
}
async function SetToken(data,token){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            'UPDATE `jadal`.`user` '+
            'SET `token`="'+token+'" '+
            'WHERE `key`="'+data['key']+'"; '
        );
    } 
    catch(err){ 
        throw err; 
    } 
    finally{ 
        if (conn) 
            conn.end(); 
        return token; 
    } 
}
async function Register(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            'INSERT INTO `jadal`.`user` (`name`,`email`,`password`) ' + 
            'VALUE ("'+ data['name'] + '","' + data['email'] + '","'  + data['password'] + '") ;'
        );
    } 
    catch(err){ 
        throw err; 
    }
    finally{
        console.log(rows)
        if (conn) 
            conn.end(); 
        return rows; 
    } 
}
async function RemoveToken(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            'UPDATE `jadal`.`user` SET `token` = "" WHERE `email`= "'+
            data['email']+'"'+
            ';'
        );
        
    } 
    catch(err){ 
        throw err; 
    }
    finally{
        if (conn) 
            conn.end(); 
        //return rows[0]; 
        return "ok"; 
    } 
}

module.exports = { 

    getPwd: GetPwd,
    getEmail: GetEmail,
    getLogin: GetLogin,
    getToken: GetToken,
    getTokenByKey: GetTokenByKey,
    getTokenByKeyAndToken: GetTokenByKeyAndToken,

    setToken: SetToken,
    
    register: Register,

    removeToken: RemoveToken,

}
