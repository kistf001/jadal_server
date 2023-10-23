const mariadb = require('mariadb'); 
const vals = require('../secreatData/consts.js'); 
const pool = mariadb.createPool({ 
    host: vals.DBHost, 
    port:vals.DBPort, 
    user: vals.DBUser, 
    password: vals.DBPass, 
    connectionLimit: 5 
}); 

async function user_statics_update(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT a.user AS "key", b.name as "user", COUNT(a.user) AS "c_user"  ')+
            ('FROM test.piki AS a JOIN jadal.user AS b ON a.user = b.mongo ')+
            ('GROUP BY a.user ')
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
async function users(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT   ') +
                ('`user`, LEFT(`t_title`, 50) as "title", ') +
                ('date_format(`date_p`,"%Y-%m-%d %H:%i:%S") as "date_p", `key` ') +
            ('FROM `test`.`piki` ') + 
            ('WHERE `user` = ? ') + 
            ('ORDER BY `date_p` DESC ') +
            ('LIMIT ?,?;'),
            [ data.user, (data.page*30), 30 ], 
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
async function post(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT  `t_title` as "title", `contents` ') +
            ('FROM `test`.`piki` ') + 
            ('WHERE `key` = ? ;'), 
            [ data.id ], 
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

module.exports = { 
    user_statics_update,
    users,
    post
}