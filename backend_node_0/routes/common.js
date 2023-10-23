
const jwt = require('jsonwebtoken');
const { sequelize } = require('../db/models/index')

module.exports = (app) => {
    const application = app;
    const router = require('express').Router();
    const redis = require('redis');

    //************************************************************************/
    //
    //************************************************************************/
    function userSqlId(req) {
        userID = String(req.cookies.key)
        return jwt.verify(userID, "").userId;
    }

    //***********************************************************************//
    //
    //***********************************************************************//
    const getUserInfo = async (id) => {
        let SQL = (
            "SELECT " +
            "    COUNT(*) AS post, " +
            "   (" +
            "       SELECT COUNT(*)" +
            "       FROM " +
            "           `jadal_board`.`comment` AS A " +
            "       WHERE" +
            "           A.id_user = :userId " +
            "   ) AS comment, " +
            "   (" +
            "       SELECT COUNT(*)" +
            "       FROM " +
            "           `jadal_board`.`board_scrap` AS A " +
            "       WHERE" +
            "           A.id_user = :userId " +
            "   ) AS scrap " +
            "FROM " +
            "    `jadal_board`.`board` AS A " +
            "WHERE " +
            "    A.id_user = :userId " +
            "LIMIT 1 ;"
        );
        let data = await sequelize.query(SQL,{replacements:{userId:id}})
        return data[0][0]
    }
    const getUserPost = async (id, page) => {
        let SQL = (
            "SELECT " +
            "    `title`, id, id_type AS type, date_created AS date " +
            "FROM " +
            "    `jadal_board`.`board` AS A " +
            "WHERE " +
            "    A.id_user = :userId " +
            "LIMIT 1, 15 ;"
        );
        let data = await sequelize.query(SQL,{replacements:{userId:id}})
        return data[0]
    }
    const getUserComment = async (id) => {
        let SQL = (
            "SELECT " +
            "    `content`, id, date_created AS date " +
            "FROM " +
            "    `jadal_board`.`comment` AS A " +
            "WHERE " +
            "    A.id_user = :userId " +
            "LIMIT 1, 15 ;"
        );
        let data = await sequelize.query(SQL,{replacements:{userId:id}})
        return data[0]
    }
    const getUserScrap = async (id) => {
        let SQL = (
            "SELECT " +
            "    B.id AS id, B.title AS title  " +
            "FROM " +
            "    `jadal_board`.`board_scrap` AS A " +
            "LEFT JOIN " +
            "    `jadal_board`.`board` AS B " +
            "ON " + 
            "    A.id_board = B.id " +
            "WHERE " +
            "    A.id_user = :userId " +
            "LIMIT 1, 15 ;"
        );
        let data = await sequelize.query(SQL,{replacements:{userId:id}})
        return data[0]
    }
    const getUserGuestbook = async (id) => {
        return "";
    }
    const getUserOther = async (id) => {
        let SQL0 = (
            "SELECT " +
            "    `title`, id, id_type AS type, date_created AS date " +
            "FROM " +
            "    `jadal_board`.`board` AS A " +
            "WHERE " +
            "    A.id_user = :userId " +
            "LIMIT 1, 15 ;"
        );
        let SQL1 = (
            "SELECT " +
            "    `content`, id, date_created AS date " +
            "FROM " +
            "    `jadal_board`.`comment` AS A " +
            "WHERE " +
            "    A.id_user = :userId " +
            "LIMIT 1, 15 ;"
        );
        let data0 = await sequelize.query(SQL0,{replacements:{userId:id}})
        let data1 = await sequelize.query(SQL1,{replacements:{userId:id}})
        return [data0[0], data1[0]]
    }
    
    //***********************************************************************//
    //
    //***********************************************************************//
    // 쿠키 ID와 요청 ID가 동일할 경우 상세 정보로 보여줌
    router.get('/user/:id',(req, res)=>{
        if (req.params.id == "me"){
            getUserInfo(userSqlId(req))
            .then((data)=>{res.send({msg:"",data:data})})
            .catch((e)=>{console.log(e)})
        }
        else {
            getUserOther(58)
            .then((a)=>{
                res.send({
                    msg:"",
                    data:{
                        post:a[0],
                        comment:a[1]
                    }
                })
            })
        }
    })
    router.get('/user/:id/post',(req, res)=>{
        if (req.params.id == "me"){
            getUserPost(userSqlId(req))
            .then((data)=>{res.send({msg:"",data:data})})
            .catch((e)={})
        }
        else {
            res.send({msg:"",data:data})
        }
    })
    router.get('/user/:id/comment',(req, res)=>{
        if (req.params.id == "me"){
            getUserComment(userSqlId(req))
            .then((data)=>{res.send({msg:"",data:data})})
            .catch((e)=>{})
        }
        else {
            res.send({msg:"",data:{}})
        }
    })
    router.get('/user/:id/scrap',(req, res)=>{
        if (req.params.id == "me"){
            getUserScrap(userSqlId(req))
            .then((data)=>{res.send({msg:"",data:data})})
            .catch((e)=>{})
        }
        else {
            res.send({msg:"",data:{}})
        }
    })
    router.get('/user/:id/guestbook',(req, res)=>{
        if (req.params.id == "me"){
            getUserGuestbook(userSqlId(req))
            .then((data)=>{res.send({msg:"",data:data})})
            .catch((e)=>{})
        }
        else {
            getUserGuestbook(58)
            .then(()=>{
                res.send({msg:"",data:{}})
            })
        }
    })

    //***********************************************************************//
    //
    //***********************************************************************//
    router.post('/user/:id/guestbook',(req, res)=>{
        if (req.params.id == "me"){
            res.send({msg:"",data:{}})
        }
        else {
            res.send({
                msg:"",
                data:{}})
        }
    })

    return router;
}