const { sequelize } = require('../db/models/index')
const validator = require('validator');
const redis = require('redis');
const jwt = require('jsonwebtoken');

module.exports = (app) => {
    // https://stackoverflow.com/questions/30967822
    // when-do-i-use-path-params-vs-query-params-in-a-restful-api

    //************************************************************************/
    //
    //************************************************************************/
    const router = require('express').Router();
    const application = app;

    //************************************************************************/
    //
    //************************************************************************/
    function userSqlId(req) {
        userID = String(req.cookies.key)
        return jwt.verify(userID, "").userId;
    }

    // let redisClient;
    // (async () => {
    // redisClient = redis.createClient();
    // redisClient.on("error", (error) => console.error(`Error : ${error}`));
    // await redisClient.connect();
    // const cacheResults = await redisClient.keys("*");
    // console.log(cacheResults)
    // })();
    
    //************************************************************************/
    //
    //************************************************************************/
    const getList = async (boardType) => {
        SQL_LIST = '\
        SELECT \
            title, \
            id, \
            id_user, \
            DATE_FORMAT(date_created, "%y-%m-%d") AS date_created \
        FROM \
            `jadal_board`.`board` \
        WHERE \
            `id_type` = :boardType \
        ORDER \
        BY \
            `id` DESC \
        LIMIT \
            20;';
        let data = await sequelize.query(SQL_LIST,{replacements: {boardType:boardType}})
        // .then((t)=>{
            // resolve(t)
            // console.log(getList())
            // res.send({data:t[0]});
            // return "3";
        // })
        // .catch(err=>{console.log(err,"ss");});
        return data[0];
    }
    const getPost = async (rawParam) => {
        let SQL = (
            "SELECT " +
            "   title, " +
            "   content, " +
            "   A.id_user AS author, " +
            "   DATE_FORMAT(date_created, '%y-%m-%d')  AS created, " +
            "   (" +
            "       SELECT COUNT(*)" +
            "       FROM " +
            "           `jadal_board`.`board` AS A " +
            "       LEFT JOIN " +
            "           `jadal_board`.`board_r` AS B" +
            "       ON A.id = B.id_board" +
            "       WHERE" +
            "           A.id = :postNumber " +
            "       AND" +
            "           B.`state` = 1" +
            "   ) AS up, " +
            "   (" +
            "       SELECT COUNT(*)" +
            "       FROM " +
            "           `jadal_board`.`board` AS A " +
            "       LEFT JOIN " +
            "           `jadal_board`.`board_r` AS B" +
            "       ON A.id = B.id_board" +
            "       WHERE" +
            "           A.id = :postNumber " +
            "       AND" +
            "           B.`state` = -1" +
            "   ) AS down," +
            "   3 AS `view`, " +
            "   COALESCE((" +
            "       SELECT IF (B.state=1, 1, 0) AS 'v' " +
            "       FROM " +
            "           `jadal_board`.`board_scrap` AS B" +
            "       WHERE" +
            "           B.id_board = :postNumber " +
            "   ), 0) AS scrap " +
            "FROM  " +
            "   `jadal_board`.`board` AS A  " +
            "LEFT JOIN  " +
            "   `jadal_board`.`board_r` AS B " +
            "ON " + 
            "   A.id = B.id_board " +
            "WHERE " +
            "   A.id = :postNumber " +
            "LIMIT 1 ;"
        );
        let postNumber = Number(rawParam) // post number
        let data = await sequelize.query(SQL,{replacements: {postNumber:postNumber}})
        return data[0][0]
    }
    const getComment = async (contentPage, commentPage) => {
        let SQL = (
            "SELECT " +
            // "   title, " +
            "   content, " +
            "   A.id_user AS author, " +
            "   DATE_FORMAT(A.date_created, '%y-%m-%d') AS created " +
            "FROM " +
            "   `jadal_board`.`comment` AS A " +
            // "LEFT JOIN " +
            // "   `jadal_board`.`board_r` AS B " +
            // "ON " + 
            // "   A.id = B.id_board " +
            "WHERE " +
            "   A.id_board = :contentNumber " +
            "LIMIT :commentPage, 30 ;"
        );
        let data = await sequelize.query(SQL,{replacements:{
            contentNumber:contentPage,
            commentPage:commentPage
        }})
        return data[0].map((a)=>{
            return [a.content, [a.author,a.author], a.created]
        })
    }
    router.get('/board', (req, res) => { // list
        let boardType = Number(req.query.boardType)
        getList(boardType)
        .then((a)=>{res.send({data:a});})
        .catch(()=>{
            // res.send({data:a});
        })
    })
    router.get('/board/:id',(req, res)=>{
        getPost(req.params.id).then((recvedData)=>{
            getComment(req.params.id, 0).then((a)=>{
                res.send({data:{
                    "msg":"",
                    "post":{
                        "title" : recvedData.title,
                        "content" : recvedData.content,
                        "author" : ["namea", recvedData.author],
                        "created" : recvedData.created,
                        "thumbUP" : recvedData.up,
                        "thumbDown" : recvedData.down,
                        "view" : 100,
                        "cmtNum" : 1232,
                        "scrap" : recvedData.scrap
                    },
                    "comment":a
                }})
            })
        });
    })
    router.get('/board/:id/comment',(req, res)=>{
        let commentPage = Number(req.query.page);
        getComment(req.params.id, commentPage)
        .then((a)=>{
            res.send({data:{
                "msg":"",
                "comment":a
            }})
        })
    })

    //************************************************************************/
    //
    //************************************************************************/
    const writePost = async (userID, req) =>{
        let recvJSON = {
            userID : Number(userID),
            boardtype : req.body.boardType,
            ...req.body.data
        }
        console.log(recvJSON)

        let SQL = (
            "INSERT INTO \
                `jadal_board`.`board` \
                (`id_type`, `title`, `content`, `id_user`) \
            VALUE \
                ( :boardtype, :title, :content, :userID );"
        );

        let data = await sequelize.query(SQL, {replacements: recvJSON})

        return data
    }
    const writeComment = async (userID, req) => {
        let recvJSON = {
            id_user:userID,
            id_board:req.body.number,
            content:req.body.content,
        }
        let SQL = (
            "INSERT INTO \
                `jadal_board`.`comment` \
                (`id_user`, `id_board`, `id_parent`, `content`) \
            VALUE \
                ( :id_user, :id_board, '0', :content );"
        );
        let data = await sequelize.query(SQL, {replacements: recvJSON})
        return data
    }
    router.post('/board', (req, res) => { // write
        writePost(userSqlId(req), req)
        .then((ww)=>{res.send({asfasdf:"rkqa"});})
        .catch((e)=>{console.log(e);})
    })
    router.post('/board/:id/comment', (req, res) => {
        writeComment(userSqlId(req), req)
        .then((ww)=>{res.send({asfasdf:"rkqa"});})
        .catch((e)=>{console.log(e);})
    })

    //************************************************************************/
    //
    //************************************************************************/
    const writeScrap = async (postID, user, state) => {
        
        if ( (state != 1) && (state != 0) ) return "err";

        let recvJSON = {
            postId : postID,
            user : user,
            value : state
        }

        let SQL = (
            "INSERT INTO \
                `jadal_board`.`board_scrap` \
                (`id_board`, `id_user`, `state`) \
            VALUE \
                ( :postId, :user, :value ) \
            ON DUPLICATE KEY UPDATE \
                `state`=:value;"
        );
        
        let data = await sequelize.query(SQL, {replacements: recvJSON})

        return data

    }
    const writeLike = async (postID, user, state) => {
        let stateValidated = state;
        
        if ( (state != 1) && (state != 0) && (state != -1) ) return "err";

        let recvJSON = {
            postId : postID,
            user : user,
            value : stateValidated
        }

        let SQL = (
            "INSERT INTO \
                `jadal_board`.`board_r` \
                (`id_board`, `id_user`, `state`) \
            VALUE \
                ( :postId, :user, :value ) \
            ON DUPLICATE KEY UPDATE \
                `state`=:value;"
        );
        
        let data = await sequelize.query(SQL, {replacements: recvJSON})

        console.log(postID, user, state)
   
        return data

    }
    router.put('/board/:id/scrap', (req, res) => { // write
        writeScrap(req.params.id, userSqlId(req), req.body.state)
        .then((data)=>{
            res.send({msg:"ok"});
        })
        .catch((data)=>{
            console.log(data)
            res.send({msg:"err"});
        })
    })
    router.put('/board/:id/like', (req, res)=>{
        writeLike(req.params.id, userSqlId(req), req.body.state)
        .then((data)=>{
            res.send({msg:"ok"});
        })
        .catch((data)=>{
            res.send({msg:"err"});
        })
    })

    return router;
}