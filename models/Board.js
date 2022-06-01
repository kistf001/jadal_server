const mdbConn = require('../db/mariaDBBoard.js');
let fd = 0
function list_request(data,next) {

    let board_type = data.board;

    if(board_type==="free") data.board="free";
    if(board_type==="suggest") data.board="suggest";
    if(board_type==="discuss") data.board="discuss";
    if(board_type==="singo") data.board="singo";

    mdbConn.list_request(data).then((ssss)=>{
        //console.log(fd);fd++
        next(null,ssss.map((v,i)=>{
            return ({
                counter:v.counter,
                user:v.user,
                key:v.key,
                title:v["contents"].replace(/(<([^>]+)>)/ig,""),
            })
        }) )
    })

}
function contents_request(data,next) {
    mdbConn.contents_request(data.number).then((ssss)=>{
        //console.log(fd);fd++
        next(null,ssss.map((v,i)=>{
            return({
                key:v.key,
                user:v.user,
                counter:v.counter,
                contents:v.contents,
                title:v["title"].replace(/(<([^>]+)>)/ig,""),
            })
        }) )
    })
}
function contents_write(data,next) {

    let board_type = data.board;

    if(board_type==="free") data.board="free";
    else if(board_type==="suggest") data.board="suggest";
    else if(board_type==="discuss") data.board="discuss";
    else if(board_type==="singo") data.board="singo";
    else return 0
    //console.log(fd);fd++
    
    mdbConn.contents_write(data).then((ssss)=>{
        next(null,"sss")
    })
	
}
function comment_request(data,next) {
    mdbConn.comment_request(data).then((ssss)=>{
        next(
            null,
            ssss.map((v,i)=>{return ({
                contents:v.contents,
                user:v.user,
                date:v.date
            })})
        )
    })
}
function comment_write(data,next) {
    mdbConn.comment_write(data).then((ssss)=>{
        next(null,"ssss")
    })
}

module.exports = { 
    list_request:list_request,
    contents_request,
    contents_write,
    comment_request,
    comment_write
}