//const http = require('http');
//
//http.createServer((req, res) => {
//  res.statusCode = 200;
//  res.setHeader('Content-Type', 'text/plain');
//  res.end('Hello World');
//}).listen(3000);


/****************************************************************************/
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express'); 
const app = express(); 

const { auth,auth2 } = require('./middleware/auth');


/****************************************************************************/
//application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));
//application/json 
app.use(bodyParser.json());
app.use(cookieParser());


/****************************************************************************/
const Ranking = require('./ranking/Ranking');
var fs = require('fs');

app.post('/api/ranking/list', (req, res) => {
    Ranking.list_request().then((ssss)=>{
        res.status(200).json(ssss)
        console.log(ssss)
    })
})
app.get('/api/video',(req,res)=>{
    //const {pathname} = url.parse(req.url, true)
    //const filepath = `./resource${pathname}`
    const filepath = `H:\\dump\\2.mp4`
    
    const stat = fs.statSync(filepath)
    const fileSize = stat.size
    const range = req.headers.range;
    //console.log(range)

    if(!range){
        const header = { 'Content-Type':'video/mp4' }
        res.writeHead(200, header);
        res.end()
    }
    else{
        const MAX_CHUNK_SIZE = 1000 * 1000 * 10
    	// ranage헤더 파싱
        const parts = range.replace(/bytes=/, "").split("-");
        // 재생 구간 설정
        const start = parseInt(parts[0], 10);
        const _end = parts[1] ? parseInt(parts[1], 10) : fileSize-1
        const end = Math.min(_end, start + MAX_CHUNK_SIZE - 1)

        const header = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Type'  : 'video/mp4',
            'Content-Length': fileSize-1,
        }
        res.writeHead(206, header);
        const readStream = fs.createReadStream(filepath,{start,end} )
        readStream.pipe(res);
    }
})


/****************************************************************************/
const Contents = require('./models/Contents');

app.post('/api/wiki/list', (req, res) => {
	let userssss = req.body.id;
	let commands = req.body.cmd;
	let pagepage = req.body.page;
    Contents.wikiList(pagepage,(err,results)=>{
        res.status(200).json(results)
    })
})
app.get('/api/wiki/view/:id', (req, res) => {
    let id = req.params.id
    if (isNaN(id)){ return 0 } 
    Contents.wikiRead(id,(err,results)=>{
        res.status(200).json(results)
    })
})
app.post('/api/wiki/history', (req, res) => {
    let id = req.body.id
    Contents.wikiHistory(id,(err,results)=>{
        res.status(200).json(results)
    })
})
app.post('/api/wiki/generate', (req, res) => {
    
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
app.post('/api/wiki/edit', (req, res) => {
    
	let contents = req.body.lastContents;
	let contents_id = req.body.contentsId;


	if(isNaN(contents_id)){}

    let token = req.cookies.x_auth;

	/* 만약 토큰이 있다면 */
	/* 유저 데이터로 실행 */
	if(token){
    
		auth(req, res, ()=>{ // 진짜유저라면
            let data = {
                key:req.user.key,
                token:req.user.token,
                contents_id:contents_id,
                contents:contents
            }
            Contents.wikiEdit(data,()=>{
            })
        });

    }

	/* 만약 토큰이 없다면 */
	/* ip로 등록 실행 */
	else {

	}
    
})
app.post('/api/wiki/like', auth2, (req, res) => {
        let data = {
            key:req.user,
            token:req.token,
            contents_id:req.body.id,
            state:req.body.flag
        }
        Contents.wikiLike(data,()=>{
		    res.status(200).json("OK"); 
            console.log(data)
        })
})


/****************************************************************************/
const Piki = require('./models/Piki');

app.post('/api/piki', (req, res) => {
    
	let userssss = req.body.id;
	let commands = req.body.cmd;
	let pagepage = req.body.page;

	if (commands=="list") { 
		res.status(200).json(Piki.user_statics_data()); 
	}
	else if (commands=="users") {
        Piki.users({id:userssss,page:pagepage},(results)=>{
            res.status(200).json(results)
        })
	}
	else if (commands=="post") {
        Piki.post({id:userssss},(results)=>{
            res.status(200).json(results[0])
        })
	}

})


/****************************************************************************/
const Board = require('./models/Board');

app.get('/api/board/search/', (req, res) => {
})
app.post('/api/board', auth2, (req, res) => {

    let data = {}

    data = {
        //
        commands:req.body.command,
        board:req.body.type,
        number:req.body.number,
        //
        login_cheack:req.cheack,
        user:req.user,
        contents:req.body.contents,
        //
        comment:req.body.comment
    }

    //console.log(data)

    if(data.login_cheack){
        if (data.commands==='contents_write'){
            Board.contents_write(data,(err,aaa)=>{
                res.status(200).json({ 
                    error:false
                });
            })
        }
        else if (data.commands==='comment_write'){
            //console.log(data.login_cheack)
            Board.comment_write(data,()=>{
                res.status(200).json({ 
                    isAuth: true, 
                    error: false
                });
            })
        }
    }

	if (data.commands==='list_request'){
        Board.list_request(data,(err,aaa)=>{
            res.status(200).json( aaa  );
        })
	}
	else if (data.commands==='contents_request'){
        Board.contents_request(data,(err,aaa)=>{
            res.status(200).json( aaa  );
        })
	}
	else if (data.commands==='comment_request'){
        //console.log(data)
        Board.comment_request(data,(err,aaa)=>{
            console.log(aaa)
			res.status(200).json(aaa);
        })
	}

})


/****************************************************************************/
const Refrash = require('./models/Refrash');

app.post('/api/modifiedCheack', (req, res) => {
		res.status(200).json([
            Refrash.modified_cheack_data(),
            Refrash.new_cheack_data()
        ]);
})


/****************************************************************************/
const User = require('./models/User');

app.get('/api/users/auth', auth, (req, res) => {

    console.log(req.user)

	res.status(200).json({
	    id: req.user.key,
	    isAdmin: req.user.role === 'master' ? false : true,
	    isAuth: true,
	    email: req.user.email,
	    name: req.user.name,
	    role: req.user.role,
	})

})
app.post('/api/users/login', (req, res) => {
    let userData = {
        email:req.body["email"],
        password:req.body["password"]
    }
    User.login(userData, (err, msg)=>{
        if (err) {
            return res.json(msg)
        }
        else {
            return res.status(200).cookie("x_auth", msg.token).json(msg)
        }
    });
})
app.post('/api/users/logout', (req, res) => {
    let userData = {
        email:req.body["email"],
        token:req.body["token"]
    }
    User.logout(userData,(err, msg)=>{
        //console.log(userData)
        if (err) {
            return res.json(msg)
        }
        else {
            return res.cookie("x_auth", "").json(msg)
        }
    })
})
app.post('/api/users/register', (req, res) => {
    let data = {
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
    }
    User.register(data,(err,userInfo)=>{
        //console.log(userData)
		if (err) return res.json({ success: false, err })
		return res.status(200).json({
			success: true
		})
    });

})


/****************************************************************************/
const port = 5000


/****************************************************************************/
app.listen(port, () => console.log(`Example app listening on port ${port}!`))