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

async function GetWikiList(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT  `key`,  `title_o`,  `title_t`') +
            ('FROM `test`.`wiki`') +
            ('LIMIT ?,?;'),
            [(data*30),30]
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
async function GetWikiContent(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT `contents`, date_format(`date`,"%Y-%m-%d %H:%i:%S") as "date" ') +
            ('FROM `test`.`wiki` ') +
            ('WHERE `key` = ?;'), 
            [data]
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
async function GetWikiHistory(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT  `key`, DATE_FORMAT(`date`,"%Y-%m-%d %H %T") AS date, `revision`, `summary`, `user`, `ip` ') +
            ('FROM `test`.`wiki_log` ') +
            ('WHERE contents_id=? ') +
            ('ORDER BY `key` DESC ') +
            ('LIMIT ?,?;'),
            [data,0,30],
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
async function _UpdateWikiContent_changeContent(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            "UPDATE `test`.`wiki` "+
            "SET `user`=?, `contents`=?, `revision`=?, `user`=?, `ip`=? "+
            "WHERE `key` = ?;", 
			[
                String(data.now_user_key), 
                data.now_contents,
				data.now_revision,
				data.now_user_key,
				data.now_ip,
				data.contents_key,
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
async function _UpdateWikiContent_logging(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            "INSERT INTO `test`.`wiki_log` "+
            "( `contents`, `user`, `ip`, `revision`, `contents_id` ) "+
            "VALUE (?, ?, ?, ?, ?);",
            [
                data.prv_contents,
                data.prv_user_key,
                data.prv_ip,
                data.prv_revision,
                data.contents_key,
            ],
        );
    } 
    catch(err){ 
        throw err; 
    }
    finally{
        if (conn) 
            conn.end(); 
        return data; 
    } 
}
async function _UpdateWikiContent_contentsInfo(data){
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            ('SELECT  `contents`, `date`, `user`, `ip`, `revision`, `key` ') +
            ('FROM `test`.`wiki` WHERE `key` = ? ;'),
            data.contents_id,
        );
    } 
    catch(err){ 
        throw err; 
    }
    finally{
        if (conn) 
            conn.end();
        return {

            contents_key:rows[0].key,

            prv_date:rows[0].date,

            prv_contents:rows[0].contents,
            prv_revision:rows[0].revision,
            prv_user_key:rows[0].user,
            prv_ip:rows[0].ip,

            now_contents:data.contents,
            now_revision:rows[0].revision+1,
            now_user_key:data.key,
            now_ip:rows[0].ip,

        };
    } 
}
async function UpdateWikiContent(data){
    _UpdateWikiContent_contentsInfo(data)
    .then(_UpdateWikiContent_logging)
    .then(_UpdateWikiContent_changeContent)
}
async function AddLike(data){
    //http://trandent.com/article/etc/detail/773
    let conn, rows;
    try{
        conn = await pool.getConnection(); 
        rows = await conn.query(
            "INSERT INTO `test`.`wiki_like` ( `user`, `wiki_key` ) "+
            "SELECT ?,? "+
            "FROM DUAL "+
            "WHERE NOT EXISTS "+
            "(SELECT `user` FROM `test`.`wiki_like` WHERE `user` = ? AND `wiki_key` = ?) LIMIT 1 "
            ,
			[
                Number(data.key), 
                Number(data.contents_id),
                Number(data.key), 
                Number(data.contents_id),
			],
        );
    }
    catch(err){ 
        throw err; 
    }
    finally{
        if (conn) 
            conn.end(); 
        console.log(rows)
        return rows; 
    }
}

module.exports = { 
    wikiHistory:GetWikiHistory,
    readWiki:GetWikiContent,
    wikiList:GetWikiList,
    wikiEdit:UpdateWikiContent,
    AddLike
}
