const mariadb = require('mariadb'); 
const vals = require('../secreatData/consts.js'); 
const pool = mariadb.createPool({ 
    host: vals.DBHost, 
    port:vals.DBPort, 
    user: vals.DBUser, 
    password: vals.DBPass, 
    connectionLimit: 5 
}); 

async function list_request(boafdrd_type){
    let conn, rows;
    try{

        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT  `key`, LEFT(`contents`, 30) as "contents",  "user",  "counter" ') +
            ('FROM `test`.`board` ') + 
            ('WHERE `type` = ? ') + 
            ('ORDER BY `key` DESC ') +
            ('LIMIT 10;'), 
            [boafdrd_type.board]
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
async function contents_request(boafdrd_type){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT  `key`,  `user`, LEFT(`contents`, 30) as "title", `counter`, `contents`  ') +
            ('FROM `test`.`board`') + 
            ('WHERE `key` = ? ;'),//('LIMIT 10;'),
            [boafdrd_type]
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
async function contents_write(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            "INSERT INTO `test`.`board` "+
            "( `contents`, `user`, `type` ) "+
            "VALUE (?, ?, ?); ",
            [
                String(data.contents),
                String(data.user),
                data.board
            ],
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
async function comment_request(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT  `key`, `contents`, `date`,`user` ') +
            ('FROM `test`.`comment` ') + 
            ('WHERE `board_key` = ? ') + 
            ('LIMIT 10; '),
            [data.number]
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
async function comment_write(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            "INSERT INTO `test`.`comment` "+
            "( `board_key`, `contents`, `user` ) "+
            "VALUE (?, ?, ?); ",
            [
                Number(data.number),
                String(data.comment),
                Number(data.user),

            ],
        );
    } 
    catch(err){ 
        throw err; 
    } 
    finally{ 
        if (conn) 
            conn.end(); 
        //console.log(
        //    "dd",data,rows,"-----------"
        //)
        return rows; 
    }
}

module.exports = { 
    list_request:list_request,
    contents_request,
    contents_write,
    comment_request,
    comment_write
}