const mdbConn = require('../db/mariadbContents.js');

function WikiList(data,next){ 
    mdbConn.wikiList(data).then((value)=>{
        next(null,value)
    })
}
function WikiRead(data,next){
    mdbConn.readWiki(data).then((value)=>{
        let adfdf = [value[0].contents,value[0].date]
        next(null,adfdf)
    })
}
function WikiHistory(data,next){
    mdbConn.wikiHistory(data).then((value)=>{
        let asdasd = value.map((s)=>{
            return ({
                key:s["key"],
                date:s["date"],
                revision:s["revision"],
                user:s["user"],
                summary:s["summary"]
            })
        })
        next(null,asdasd)
    })
}
function WikiEdit(data,next){

    // 인증 유저
    mdbConn.wikiEdit(data).then((value)=>{
        next()
    })

}
function WikiLike(data,next){
    mdbConn.AddLike(data).then((aaaaa)=>{
        next(aaaaa);
    });
}

module.exports = { 
    wikiList:WikiList,
    wikiRead:WikiRead,
    wikiHistory:WikiHistory,
    wikiEdit:WikiEdit,
    wikiLike:WikiLike
}