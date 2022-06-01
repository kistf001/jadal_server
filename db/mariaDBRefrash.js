const mariadb = require('mariadb'); 
const vals = require('../secreatData/consts.js'); 
const pool = mariadb.createPool({ 
    host: vals.DBHost, 
    port:vals.DBPort, 
    user: vals.DBUser, 
    password: vals.DBPass, 
    connectionLimit: 5 
}); 

async function refrash_modified(){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT ')+
            ('date_format(`wiki_log`.`date`,"%m-%d %H:%i") AS "date",')+
            ('`wiki`.`title_t`, ') +
            ('`wiki_log`.`contents_id` AS "key" ') +
            ('FROM `test`.`wiki_log`, `test`.`wiki` ') +
            ('WHERE `wiki_log`.`contents_id` = `wiki`.`key` ') +
            ('GROUP BY `wiki_log`.`contents_id` ') + 
            ('ORDER BY `wiki_log`.`key` DESC ') +
            ('LIMIT 0,20;'),
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

async function refrash_new(){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT `key`, LEFT(`title_t`, 30) as "title" ') +
            ('FROM `test`.`wiki` ') +
            ('ORDER BY `wiki`.`key` DESC ') +
            ('LIMIT 0,20;'),
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
    refrash_modified:refrash_modified,
    refrash_new:refrash_new
}
//connection.query(
//    ('SELECT ')+
//        ('date_format(`wiki_log`.`date`,"%m-%d %H:%i") AS "date",')+
//        ('`wiki`.`title_t`, ') +
//        ('`wiki_log`.`contents_id` AS "key" ') +
//    ('FROM `test`.`wiki_log`, `test`.`wiki` ') +
//    ('WHERE `wiki_log`.`contents_id` = `wiki`.`key` ') +
//    ('GROUP BY `wiki_log`.`contents_id` ') + 
//    ('ORDER BY `wiki_log`.`key` DESC ') +
//    ('LIMIT 0,20;'),
//    function (error, results, fields) {
//        // 에러인지 검출
//        if (error) { console.log(error); }
//        modified_cheack_data = results.map((v,i)=>{ return {key:v.key,title:v.title_t,date:v.date,} });
//        //console.log(modified_cheack_data);
//    }
//);
//connection.query(
//    ('SELECT `key`, LEFT(`title_t`, 30) as "title" ') +
//    ('FROM `test`.`wiki` ') +
//    ('ORDER BY `wiki`.`key` DESC ') +
//    ('LIMIT 0,20;'),
//    function (error, results, fields) {
//        //// 에러인지 검출
//        //if (error) { console.log(error); }
//        new_cheack_data = results.map((v,i)=>{ return {key:v.key,title:v.title} });
//        //console.log(results);
//    }
//);