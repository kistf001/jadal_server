const express = require('express')
const app = express()
const axios = require("axios")
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");


//application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost:27017/test", {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

const  mysql = require('mysql');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'minamigano6565minamiga',
	database : 'test'
});
connection.connect();

app.post('/api/wiki/edit', (req, res) => {

	let contents = req.body.lastContents;
	let contents_id = req.body.contentsId;
	if(isNaN(contents_id)){}

	// 사용자일 경우에 쿠키 받음
    let token = req.cookies.x_auth;

	/* 만약 토큰이 있다면 */
	/* 유저 데이터로 실행 */
	if(token){ // db에 넣고 검토해서 가짜유저인지 탐지한다.
		auth(req, res, ()=>{ // 진짜유저라면
			if(req.user._id){ // 메인 db에서 로그에 저장할 값을 불러온다.
				connection.query(
					('SELECT  `key`, `contents`, `date`, `user`, `ip`, `revision` ') +
					('FROM `test`.`wiki` WHERE `key` = ? ;'),
					contents_id,
					function (error, results, fields) {
						if (error) console.log(error);//console.log(mail_results)
						let mail_results = results[0];
						// 그 값을 로그에 집어넣은다.
						connection.query( 
							"INSERT INTO `test`.`wiki_log` SET ?", 
							{
								contents: mail_results.contents,
								user: mail_results.user, ip: mail_results.ip,
								revision: mail_results.revision, contents_id: contents_id
							},
							function (error, resultsss, fields) {
								if (error) console.log(error);//console.log(resultsss);
								// 바꿀 값을 메인 db에 넣는다.
								connection.query( 
									"UPDATE `test`.`wiki` SET ? WHERE `key` = ?;", 
									[
										{
											user: req.user._id, contents: contents,
											revision: mail_results.revision+1
										},
										contents_id
									],
									function (error, results, fields) {
										if (error) console.log(error);//console.log(results);
										res.status(200).json({ error:false });
									}
								);
							}
						);
					}
				);
			} 
		});
	} 
	
	/* 만약 토큰이 없다면 */
	/* ip로 등록 실행 */
	else {
		res.status(200).json({ error:true });

		//// 기존의 내용을 log에 저장한다.
		//connection.query(
		//	('SELECT  `key`,  `contents`,  `date`, `user`, `ip`  ') +
		//	('FROM `test`.`wiki` ') + 
		//	('WHERE `key` = "')+contents_id+('" '),
		//	function (error, results, fields) {
		//		if (error) console.log(error);

		//		//res.status(200).json({ asdas:results[0] });

		//		//// 자격이 있다면 사용자 정보를 가져오고 그 것을 사용하여
		//		////insert into usertbl (username, userid) values ('춘배' , 'cnsqo12') 
		//		connection.query(
		//			('INSERT  INTO `test`.`wiki_log` ')+
		//				('(`contents`, `user`, `ip`, `revision`) ') +
		//			('VALUE ') +
		//				('("' ) + results[0].contents +
		//				('","') + req.user._id + 
		//				('","') + 0 + 
		//				('","') + 1 + 
		//				('")'),
		//			function (error, results, fields) {
		//				if (error) { console.log(error); } //console.log(results);
		//				res.status(200).json({ error:false });
		//			}
		//		
		//		);

		//	}
		//
		//);

	}

})
app.get('/api/wiki/search', (req, res) => {
	res.status(200).json({
		success: true,
	})
})
app.post('/api/wiki/list', (req, res) => {
	
	let userssss = req.body.id;
	let commands = req.body.cmd;
	let pagepage = req.body.page;
	
	//console.log(req, res);
	// mysql에 목록을 쿼리함
	connection.query(
		('SELECT  `key`,  `title_o`,  `title_t`') +
		('FROM `test`.`wiki`') +
		('LIMIT ?,?;'),
		[(pagepage*30),30], 
		function (error, results, fields) {
			// 에러인지 검출
	    	if (error) { console.log(error); }
	    	//console.log(results);
			// 요청응답
			res.status(200).json(results)
		}
	);
})
app.get('/api/wiki/view/:id', (req, res) => {
	console.log('ID:', req.params.id);
    if (isNaN(req.params.id)){ return 0 } 
	connection.query(
		('SELECT `contents`, date_format(`date`,"%Y-%m-%d %H:%i:%S") as "date" ') +
		('FROM `test`.`wiki` ') +
		('WHERE `key` = ?;'), 
		[req.params.id],
		function (error, results, fields) {
			// 에러인지 검출
			if (error) { console.log(error); res.status(403); }
			if (results[0]!=null) {
				res.status(200).json([results[0].contents,results[0].date]) // 요청응답
			}
		}
	);
})
app.get('/api/wiki/other/:id', (req, res) => {
	res.status(200).json("user_statics_data"); 
})
app.post('/api/wiki/history', (req,res)=>{

	
	connection.query(
		('SELECT  `key`, `date`, `revision`, `summary`, `user`, `ip` ') +
		('FROM `test`.`wiki_log` ') +
		('WHERE contents_id=? ') +
		('ORDER BY `key` DESC ') +
		('LIMIT ?,?;'),
		[req.body.id,0,30],
		function (error, results, fields) {
			// 에러인지 검출
	    	if (error) { console.log(error); }
			let asdasd = results.map((s)=>{
				return ({
					key:s["key"],
					date:s["date"],
					revision:s["revision"],
					user:s["user"],
					summary:s["summary"]
				})
			})
			// 요청응답
			res.status(200).json(asdasd); 
		}
	);


})
app.post('/api/wiki/generate', (req,res)=>{

	//console.log(req.body.contents);
	//res.status(200).json();
	
	connection.query(
		('INSERT INTO `test`.`dev_wiki` SET ? ;'),
		{
			//key
			contents:String(req.body.contents),
			//date
			//date_r
			//title_o
			//title_t
			//parent
			//user
			//ip
			//revision
			//composer
		},
		function (error, results, fields) {
			// 에러인지 검출
	    	if (error) { console.log(error); }
			console.log(results);
			// 요청응답
			res.status(200).json({id:results.insertId}); 
		}
	);

})
app.get('/api/wiki/ewewew/:id', (req,res)=>{

	connection.query(
		('SELECT ') +
			('`piki`.`key` AS "key", ') +
			('`piki`.`t_title` AS "title" ') +
		('FROM ') +
			('`test`.`wiki`, ') +
			('`test`.`piki` ') +
		('WHERE ') +
			('`wiki`.`key`=? ') +
				('AND ') +
			('`wiki`.`site_type`=`piki`.`site_type` ') +
				('AND ') +
			('`wiki`.`site_id`=`piki`.`site_id` ') +
		('ORDER BY ') +
			('`test`.`piki`.`key` DESC  ') +
		('LIMIT 0, 10 ;'),
		[req.params.id],
		function (error, results, fields) {
			// 에러인지 검출
	    	if (error) { console.log(error); }
			console.log(results);
			// 요청응답
			console.log('ID:', req.params.id);
			res.status(200).json(results); 
		}
	);

})


let modified_cheack_data, new_cheack_data;
let _cheack = () => {
	connection.query(
		('SELECT ')+
			('date_format(`wiki_log`.`date`,"%m-%d %H:%i") AS "date",')+
			('`wiki`.`title_t`, ') +
			('`wiki_log`.`contents_id` AS "key" ') +
		('FROM `test`.`wiki_log`, `test`.`wiki` ') +
		('WHERE `wiki_log`.`contents_id` = `wiki`.`key` ') +
		('GROUP BY `wiki_log`.`contents_id` ') + 
		('ORDER BY `wiki_log`.`key` DESC ') +
		('LIMIT 0,20;'),
		function (error, results, fields) {
			// 에러인지 검출
			if (error) { console.log(error); }
			modified_cheack_data = results.map((v,i)=>{ return {key:v.key,title:v.title_t,date:v.date,} });
			//console.log(modified_cheack_data);
		}
	);
	connection.query(
		('SELECT `key`, LEFT(`title_t`, 30) as "title" ') +
		('FROM `test`.`wiki` ') +
		('ORDER BY `wiki`.`key` DESC ') +
		('LIMIT 0,20;'),
		function (error, results, fields) {
			//// 에러인지 검출
			//if (error) { console.log(error); }
			new_cheack_data = results.map((v,i)=>{ return {key:v.key,title:v.title} });
			//console.log(results);
		}
	);
}
setInterval(()=>{ _cheack() },1000); _cheack()
app.get('/api/modifiedCheack', (req, res) => {
	if(modified_cheack_data!=0){
		res.status(200).json([modified_cheack_data,new_cheack_data]);
	}
})


let user_statics_data;
let user_statics_update = () => {
	connection.query(
		('SELECT  user, COUNT(user) as "c_user" ') + 
		('FROM test.piki ')+ 
		('GROUP BY user ;'), 
		function (error, results, fields) {
			if (error) console.log(error);
			let sadfkladf = [];
			let asfadsf = 0;
			for (var key in results) { 
				let keysss = key
				User.findById(results[key]['user'],function (err, user) {
					asfadsf++;
					sadfkladf.push({
						name:user.name,
						counter:results[keysss]["c_user"],
						key:results[keysss]['user']
					});
					if(asfadsf==results.length){
						user_statics_data = sadfkladf
					}
				});
			}
			//console.log(user.name,results[keysss]["c_user"]);
		}
	);
}
setInterval(()=>{ user_statics_update() },10000); user_statics_update();
app.post('/api/piki', (req, res) => {
	
	let userssss = req.body.id;
	let commands = req.body.cmd;
	let pagepage = req.body.page;

	console.log(commands, userssss);

	if (commands=="list") { 
		res.status(200).json(user_statics_data); 
	}

	else if (commands=="users") {
		connection.query(
			('SELECT   ') +
				('`user`, ') +
				('LEFT(`t_title`, 50) as "title", ') +
				('date_format(`date_p`,"%Y-%m-%d %H:%i:%S") as "date_p", ') +
				('`key` ') +
			('FROM `test`.`piki` ') + 
			('WHERE `user` = "')+userssss+('" ') + 
			('ORDER BY `date_p` DESC ') +
			('LIMIT ?,?;'),
			[(pagepage*30),30], 
			function (error, results, fields) { res.status(200).json(results); }
		);
	}

	else if (commands=="post") {
		connection.query(
			('SELECT  `t_title` as "title", `contents` ') +
			('FROM `test`.`piki` ') + 
			('WHERE `key` = "')+userssss+('" ;'), 
			function (error, results, fields) { res.status(200).json(results[0]); }
		);
	}

	//console.log(req, res), console.log(board_type), 

})


app.get('/api/board/search/', (req, res) => {
	res.status(200).json({
		success: true,
	})
})
app.post('/api/board', (req, res) => {

	var board_type = req.body.type;
	var commands = req.body.command;

	//console.log(req, res), console.log(board_type), console.log(commands);

	if(commands=='list_request'){

		let boafdrd_type = "";
	
		if(req.body.type=="free") boafdrd_type="free";
		if(req.body.type=="suggest") boafdrd_type="suggest";
		if(req.body.type=="discuss") boafdrd_type="discuss";
		if(req.body.type=="singo") boafdrd_type="singo";

		// mysql에 목록을 쿼리함
		connection.query(
			('SELECT  `key`, LEFT(`contents`, 30) as "contents",  `user`,  `counter`  ') +
			('FROM `test`.`board` ') + 
			('WHERE `type` = "')+boafdrd_type+('" ') + 
			('ORDER BY `key` DESC ') +
			('LIMIT 10;'), 
			function (error, results, fields) {
	
				if (error) { console.log(error); } //console.log(results);
				res.status(200).json( results.map((v,i)=>{
					return ({
						counter:v.counter,
						user:v.user,
						key:v.key,
						title:v["contents"].replace(/(<([^>]+)>)/ig,""),
					})
				}) );
			
			}
		
		);

	}

	else if (commands=='contents_request'){
			
		// mysql에 목록을 쿼리함
		connection.query(
			('SELECT  `key`,  `user`, LEFT(`contents`, 30) as "title", `counter`, `contents`  ') +
			('FROM `test`.`board`') + 
			('WHERE `key` = '+req.body.number),//('LIMIT 10;'),
			function (error, results, fields) {
	
				if (error) { console.log(error); } //console.log(results);
				res.status(200).json(results.map((v,i)=>{
					return({
						key:v.key,
						user:v.user,
						counter:v.counter,
						contents:v.contents,
						title:v["title"].replace(/(<([^>]+)>)/ig,""),
					})
				}));
			
			}
		
		);

	}

	else if (commands=='contents_write'){

		let boafdrd_type = "";

		if(req.body.boardType=="free") boafdrd_type="free";
		else if(req.body.boardType=="suggest") boafdrd_type="suggest";
		else if(req.body.boardType=="discuss") boafdrd_type="discuss";
		else if(req.body.boardType=="singo") boafdrd_type="singo";
		else res.status(200).json({a:1});
		
		// auth를 통해 자격이 있는지 검토한다.
		auth(req, res, ()=>{
		
			//// 자격이 있다면 사용자 정보를 가져오고 그 것을 사용하여
			////insert into usertbl (username, userid) values ('춘배' , 'cnsqo12') 
			connection.query(
				('INSERT  INTO  `test`.`board` SET ? '),
				{
					contents:String(req.body.contents),
					user:req.user._id,
					type:boafdrd_type
				},
				function (error, results, fields) {
					if (error) { console.log(error); } //console.log(results);

					//res.status(200).json({ 
					//	//_id: req.user._id,
					//	isAdmin: req.user.role === 0 ? false : true,
					//	isAuth: true,
					//	email: req.user.email,
					//	name: req.user.name,
					//	lastname: req.user.lastname,
					//	role: req.user.role,
					//	image: req.user.image 
					//});

					res.status(200).json({ 
						error:false
					});

				}
			
			);

		});
		
	}
	
	else if (commands=='comment_request'){

		// mysql에 목록을 쿼리함
		connection.query(
			('SELECT  `key`, `contents`, `date`,`user` ') +
			('FROM `test`.`comment`') + 
			('WHERE `board_key` = '+req.body.number),//('LIMIT 10;'), 
			function (error, results, fields) {
				if (error) { console.log(error); }
				res.status(200).json({ results });
			}
		
		);

	}

	else if (commands=='comment_write'){
		
		if(board_type=='free'){
			
			// mysql에 목록을 쿼리함
			//insert into usertbl (username, userid) values ('춘배' , 'cnsqo12') 
			connection.query(
				('SELECT  `key`,  `title`,  `user`,  `counter`, `contents`  ') +
				('FROM `test`.`board`') + 
				('WHERE `key` = '+req.body.number),//('LIMIT 10;'), 
				function (error, results, fields) {
					if (error) { console.log(error); } //console.log(results);
					res.status(200).json({ results });
				}
			
			);

		}
		
	}


})

  
// role 1 어드민    role 2 특정 부서 어드민 
// role 0 -> 일반유저   role 0이 아니면  관리자 
app.get('/api/users/auth', auth, (req, res) => {
	//여기 까지 미들웨어를 통과해 왔다는 얘기는  Authentication 이 True 라는 말.
	res.status(200).json({
		_id: req.user._id,
		isAdmin: req.user.role === 0 ? false : true,
		isAuth: true,
		email: req.user.email,
		name: req.user.name,
		lastname: req.user.lastname,
		role: req.user.role,
		image: req.user.image
	})
})
app.post('/api/users/register', (req, res) => {
	//회원 가입 할떄 필요한 정보들을  client에서 가져오면 
	//그것들을  데이터 베이스에 넣어준다. 
	const user = new User(req.body)
	user.save((err, userInfo) => {
		if (err) return res.json({ success: false, err })
		return res.status(200).json({
			success: true
		})
	})
})
app.post('/api/users/login', (req, res) => {

	// console.log('ping')
	//요청된 이메일을 데이터베이스에서 있는지 찾는다.
	User.findOne({ email: req.body.email }, (err, user) => {

		// console.log('user', user)
		if (!user) {
			return res.json({
				loginSuccess: false,
				message: "제공된 이메일에 해당하는 유저가 없습니다."
			})
		}

		//요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
		user.comparePassword(req.body.password, (err, isMatch) => {
			// console.log('err',err)

			// console.log('isMatch',isMatch)

			if (!isMatch)
				return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

			//비밀번호 까지 맞다면 토큰을 생성하기.
			user.generateToken((err, user) => {
				if (err) return res.status(400).send(err);

				// 토큰을 저장한다.  어디에 ?  쿠키 , 로컳스토리지 
				res.cookie("x_auth", user.token)
				.status(200)
				.json({ loginSuccess: true, userId: user._id })
			})
		})
	})
})
app.get('/api/users/logout', auth, (req, res) => {
	// console.log('req.user', req.user)
	User.findOneAndUpdate(
		{ _id: req.user._id },
		{ token: "" }
		, (err, user) => {
		if (err) return res.json({ success: false, err });
		return res.status(200).send({
			success: true
		})
	})
})


const port = 5000


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
