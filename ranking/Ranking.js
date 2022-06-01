var fs = require('fs');


//fs.readFile(resourcePath, 'utf-8', function(error, data) {
//    if(error){
//      response.writeHead(500, {'Content-Type':'text/html'});
//      response.end('500 Internal Server '+error);
//    }else{
//      response.writeHead(200, {'Content-Type':'text/html'});
//      response.end(data);
//    }
//});
//
//
//
//// 1. stream 생성
//var stream = fs.createReadStream(resourcePath);
//// 2. 잘게 쪼개진 stream 이 몇번 전송되는지 확인하기 위한 count
//var count = 0;
//// 3. 잘게 쪼개진 data를 전송할 수 있으면 data 이벤트 발생 
//stream.on('data', function(data) {
//    count = count + 1;
//    console.log('data count='+count);
//    // 3.1. data 이벤트가 발생되면 해당 data를 클라이언트로 전송
//    response.write(data);
//});
//
//// 4. 데이터 전송이 완료되면 end 이벤트 발생
//stream.on('end', function () {
//    console.log('end streaming');
//    // 4.1. 클라이언트에 전송완료를 알림
//    response.end();
//});
//


const mariadb = require('mariadb'); 
const vals = require('../secreatData/consts.js'); 
const pool = mariadb.createPool({ 
    host: vals.DBHost, 
    port:vals.DBPort, 
    user: vals.DBUser, 
    password: vals.DBPass, 
    connectionLimit: 1
}); 


async function list_request(){
    let conn, rows;
    try{
        let today = new Date();   

        let year = today.getFullYear(); // 년도
        let month = today.getMonth() + 1;  // 월
        let date = today.getDate();  // 날짜
        let day = today.getDay();  // 요일

        conn = await pool.getConnection(); 
        rows = await conn.query(
            ("SELECT b.`key`, a.`rank`, TO_CHAR(a.`date`,'yyyy/mm/dd') AS date, b.`title`, b.`composer`, TO_CHAR(b.`published`,'yyyy/mm/dd') AS published, b.`singer`, c.`url` ") +
            ("FROM `ranking`.`dayily` AS `a` ") +
            ("JOIN `ranking`.`song_data` AS `b` ") +
            ("JOIN `ranking`.`song_url` AS `c` ") +
            ("ON a.`key_song_data` = b.`key` AND c.`key_song_data` = b.`key` ") +
            ("WHERE `date`=? LIMIT 30"),
            //[year + '-' + month + '-' + date,]
            ["2022-5-27",]
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
    list_request:list_request,
}