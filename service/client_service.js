var express = require('express');
// var fibers = require('fibers');
var ejs = require('ejs');
var fs = require('fs');
var path = require("path")
var crypto = require('../utils/crypto');
var db = require('../utils/db');
const schedule = require('node-schedule');
var http = require('../utils/http');
var https = require('https');
var configs = require('../config/configs');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray : false, ignoreAttrs : true});
var log4js = require('log4js');
log4js.configure({
 appenders: {
  out: { type: 'stdout' },
  app: { type: 'dateFile', filename: "logs/application" , pattern: '_yyyyMMdd.log', alwaysIncludePattern: true }
  //app: { type: 'file', filename: logFileName }
 },
 categories: {
  default: { appenders: [ 'out', 'app' ], level: 'debug' }
 }
});
var logger = log4js.getLogger();
const xlsx = require('xlsx');
var app = express();
// app.set('view engine','ejs');
//识别css样式,不引入将不知道外部样式表
app.use('/assets',express.static('assets'));
var data={};

//设置模板目录
app.set('/views', path.join(__dirname, 'views'));    
app.use(express.static('views'));
//设置模板引擎
app.set('view engine', 'html');
//设置引擎后缀.  index.html 中的内容可以是 ejs 代码
app.engine('.html', require('ejs').__express);

//首页
app.get('/',function (req, res) {
    let sqltj = "select * from gmcms_case where is_up=1 and recommend = 1 and cateid = 2 limit 0,12";
    let sql2 = "select * from gmcms_case where is_up=1 and recommend = 1 and cateid = 1 limit 0,6";
    let sqlall = sqltj + ";" + sql2 +  ";"
    db.query(sqlall, function(err, rows, fields) {
        if (err) {
            http.send(res, -1, "error", {});
        } else {
            data.ceo = rows[0]
            data.case2 = rows[1];
            data.title = "观麦科技-首页";
            data.gm_active = "index";
            res.render('src/index', data)
        }
    });
});

//关于我们
app.get('/about_us',function (req, res) {
    let sql = "select  * from gmcms_aboutus where 1  ";
    
    db.query(sql,function(err,rows,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            data.title = "观麦科技-关于我们";
            data.gm_active = "about_us";
            data.detail= rows[0]
            res.render('src/about_us',data)
        }
    });	
	
});

//荣誉证书
app.get('/certificate',function (req, res) {
     let sql = "select  * from gmcms_aboutus where 1  ";
    db.query(sql,function(err,rows,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            data.detail= rows[0]
            data.title = "观麦科技-荣誉证书";
            data.gm_active = "certificate";
            res.render('src/certificate',data)
        }
    });	
	
});

//联系我们
app.get('/contact_us',function (req, res) {
     let sql = "select  * from gmcms_aboutus where 1  ";
     db.query(sql,function(err,rows,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            res.render('src/contact_us',{title:'观麦科技-联系我们',gm_active:'contact_us',listData:rows[0]});
            // data.title = "观麦科技-联系我们";
	        // data.gm_active = "contact_us";
            // data.detail= rows[0]
            // res.render('src/contact_us',data)
        }
    });	
});

//观麦资讯-列表
app.get('/information',function (req, res) {
	let sql = "select  * from gmcms_artical where cateid=1 and is_up =1";
    db.query(sql,function(err,rows,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            res.render('src/information',{title:'观麦科技-资讯',gm_active:'information',listData:rows});
            // data.title = "观麦科技-资讯";
            // data.gm_active = "information";
            // res.render('src/information',data)
        }
    });	
});


//观麦资讯-回顾活动
app.get('/activities',function (req, res) {
	let sql = "select  * from gmcms_artical where cateid=2 and is_up =1";
    db.query(sql,function(err,rows,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            res.render('src/information',{title:'观麦科技-回顾活动',gm_active:'activities',listData:rows});
            // data.title = "观麦科技-资讯";
            // data.gm_active = "information";
            // res.render('src/information',data)
        }
    });	
});

//观麦资讯-新功能
app.get('/newfunction',function (req, res) {
	let sql = "select  * from gmcms_artical where cateid=3 and is_up =1";
    db.query(sql,function(err,rows,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            res.render('src/information',{title:'观麦科技-新功能',gm_active:'newfunction',listData:rows});
            // data.title = "观麦科技-资讯";
            // data.gm_active = "information";
            // res.render('src/information',data)
        }
    });	
});
//观麦资讯-生鲜课堂
app.get('/fresh',function (req, res) {
	let sql = "select  * from gmcms_artical where cateid=4 and is_up =1";
    db.query(sql,function(err,rows,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            res.render('src/information',{title:'观麦科技-生鲜课堂',gm_active:'fresh',listData:rows});
        }
    });	
});

//观麦资讯-内容
app.get('/information_detail/:id',function (req, res) {
    let id = req.params.id ;
    let sql = "select  * from gmcms_artical where id='"+id+"' and is_up =1";
    db.query(sql,function(err,rows,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            let cateid = rows[0]['cateid'];
            let sql="select * from gmcms_artical  where id!='"+id+"' and is_up=1 and cateid = '"+ cateid+"'  order by create_time desc limit 0,10"
            db.query(sql,function(err,rows2,fields){ 
                if(err){
                    http.send(res,-1,"error",{});
                }else{
                    res.render('src/information_detail',{title:'观麦科技-内容详情',gm_active:'information',detail:rows[0],list:rows2});
                }
            });	
        }
    });	
});
// 案例详情
app.get('/case_detail/:id', function(req, res) {
    let id = req.params.id;
    let sql = "select  * from gmcms_case where id='" + id + "' and is_up =1";
    db.query(sql, function(err, rows, fields) {
        if (err) {
            http.send(res, -1, "error", {});
        } else {
            let cateid = rows[0]['cateid'];
            let sql = "select * from gmcms_case  where id!='" + id + "' and is_up=1 and cateid = '" + cateid + "'  order by create_time desc limit 0,10"
            db.query(sql, function(err, rows2, fields) {
                if (err) {
                    http.send(res, -1, "error", {});
                } else {
                    res.render('src/case_detail', {
                        title: '观麦科技-内容详情',
                        gm_active: 'case',
                        detail: rows[0],
                        list: rows2
                    });
                }
            });
        }
    });
});
//合作案例
app.get('/case',function (req, res) {

    // 推荐位置12

    let sqltj = "select * from gmcms_case where is_up=1 and recommend = 1 and cateid = 1 limit 0,12";
    let get = req.query
    let limit = get.limit ? get.limit : '25'
    let page = get.page ? get.page : '1'

    let where = " where is_up=1 and recommend=0 and cateid = 1"
    let sql = "select  * from gmcms_case "
    let sql2 ="select  count(*) as total from  gmcms_case"

    sql += where +" order by create_time desc " +getlimit(page,limit)
    sql2 += where
    let sqlall = sqltj+";"+sql2+";"+sql+";"
    db.query(sqlall,function(err,rows,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            data.page = page
            data.limit = limit
            data.recommendlist = rows[0]
            data.total = rows[1]
            data.list = rows[2];
            data.title = "观麦科技-合作案例";
            data.gm_active = "case";
            res.render('src/case',data)
        }
    });	
});

//生鲜课堂
app.get('/class',function (req, res) {
    
	data.title = "观麦科技-生鲜课堂";
	data.gm_active = "class";
    res.render('src/class',data)
});

//价格
app.get('/charge',function (req, res) {
	data.title = "观麦科技-价格";
	data.gm_active = "charge";
    res.render('src/charge',data)
});

//中央厨房
app.get('/kitchen',function (req, res) {
	data.title = "观麦科技-中央厨房";
    data.gm_active = "kitchen";
    res.render('src/kitchen',data)
});

//配送系统
app.get('/delivery',function (req, res) {
	data.title = "观麦科技-配送系统";
    data.gm_active = "delivery";
    res.render('src/delivery',data)
});


//开放平台
app.get('/open-platform',function (req, res) {
	data.title = "观麦科技-开放平台";
	data.gm_active = "open-platform";
    res.render('src/open-platform',data)
});

//新零售
app.get('/retail',function (req, res) {
	data.title = "观麦科技-新零售";
    data.gm_active = "retail";
    res.render('src/retail',data)
});


//课程中心
app.get('/class-center',function (req, res) {
	data.title = "观麦科技-课程中心";
    let get = req.query
    let limit = get.limit ? get.limit : '24'
    let page = get.page ? get.page : '1'

    let where = " where is_up=1 and cateid=1"
    let sql = "select  * from gmcms_class "
    let sql2 ="select  count(*) as total from  gmcms_class"

    sql += where +" order by create_time desc " +getlimit(page,limit)
    sql2 += where
    db.query(sql2,function(err,rows2,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            db.query(sql,function(err,rows,fields){ 
                if(err){
                    http.send(res,-1,"error",{});
                }else{
                    data.page = page
                    data.limit = limit
                    data.total = rows2
                    data.gm_active = "class-center";
                    data.gm_menu = "class-center";
                    data.list = rows;
                    res.render('src/class-center',data)
                }
            });	
        }
    });	
});

app.get('/class-center-vip',function (req, res) {
	data.title = "观麦科技-课程中心";
    let get = req.query
    let limit = get.limit ? get.limit : '24'
    let page = get.page ? get.page : '1'

    let where = " where is_up=1 and cateid=2"
    let sql = "select  * from gmcms_class "
    let sql2 ="select  count(*) as total from  gmcms_class "

    sql += where + " order by create_time desc " +getlimit(page,limit)
    sql2 += where
    db.query(sql2,function(err,rows2,fields){ 
        if(err){
            http.send(res,-1,"error",{});
        }else{
            db.query(sql,function(err,rows,fields){ 
                if(err){
                    http.send(res,-1,"error",{});
                }else{
                    data.page = page
                    data.limit = limit
                    data.total = rows2
                    data.gm_active = "class-center";
                    data.gm_menu = "class-center-vip";
                    data.list = rows;
                    res.render('src/class-center',data)
                }
            });	
        }
    });	
});


var config = null;
var hallAddr = "";
function send(res,ret){
	var str = JSON.stringify(ret);
	res.send(str)
}
//设置跨域访问
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers","content-type");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	// res.header("X-Powered-By",' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
	// fibers(function(){
	// 	next();
	// }).run();
});



// xml
var bodyParser = require("body-parser");
app.use(bodyParser.json({limit:'100mb'}));

exports.start = function($config){

	config = $config;
	hallAddr = config.SERVER_IP  + ":" + config.SERVER_PORT;
	app.listen(config.SERVER_PORT);
	
	//HTTPS
	// var privateKey  = fs.readFileSync('/etc/nodessl/aflaon.key', 'utf8');
	// var certificate = fs.readFileSync('/etc/nodessl/aflaon.pem', 'utf8');
	// var credentials = {key: privateKey, cert: certificate};
	// var httpsServer = https.createServer(credentials, app);
	// httpsServer.listen(8443);
	console.log("service is listening on port " + config.SERVER_PORT + "");

};

function getlimit(page,pagesize){
    return  "limit "+(page-1)*pagesize +","+pagesize;
}

function getTableName(apitype){


	let tableDic = [
		{key:'news',tableName:'gmcms_artical'},
		{key:'class',tableName:'gmcms_class'},
		{key:'case',tableName:'gmcms_case'},

	];
	let tableName = "gmcms_artical"
	for(var k in tableDic){
		let tmp = tableDic[k]
		if( tmp.key == apitype){
			tableName = tmp.tableName
			break
		}

	}
	return tableName
}


//资讯
app.post('/editArtical', function(req, res, next){ 

	let post = req.body;

	let id = post.id ? post.id : false;  
	let cateid = post.cateid ? post.cateid : 1;  
	let title = post.title ? post.title : ''; 
	let author = post.author ? post.author : ''; 
	let desc = post.desc ? post.desc : ''; 
	let image = post.image ? post.image : ''; 
    image = base64ToImg(image,createRandomId());
	let content = post.content ? post.content : ''; 
	let link = post.link ? post.link : ''; 
	let pv = post.pv ? post.pv : 0; 
	let is_up = post.is_up ? 1 : 0; 
    let recommend = post.recommend ? 1 : 0; 

	let apitype = post.apitype ? post.apitype : 'news'; 
	let tableName =  getTableName(apitype)

	
	let sql = "";	
	if(id){  //修改
		sql += "update "+tableName+" set `title` = '"+title+"', ";
		sql += " `cateid` = '"+cateid+"', ";
		sql += " `author` = '"+author+"', ";
		sql += " `desc` = '"+desc+"', ";
		sql += " `image` = '"+image+"', ";
		sql += " `content` = '"+content+"', ";
		sql += " `link` = '"+link+"', ";
		sql += " `pv` = '"+pv+"', ";
        if(tableName=="gmcms_case"){
            sql += " `recommend` = '"+recommend+"', ";
        }
		sql += " `is_up` = '"+is_up+"' ";
        
		sql += " where id = '"+id+"' ";
		
	}else{
        if(tableName=="gmcms_case"){
            sql +=  "insert into "+tableName+" (`title`,`cateid`,`author`,`desc`,`image`,`content`,`link`,`pv`,`is_up`,`create_time`,`recommend`)";
		    sql += " values('"+title+"','"+cateid+"','"+author+"','"+desc+"','"+image+"','"+content+"','"+link+"','"+pv+"','"+is_up+"','"+getnow()+"','"+recommend+"');"; 
        }else{
            sql +=  "insert into "+tableName+" (`title`,`cateid`,`author`,`desc`,`image`,`content`,`link`,`pv`,`is_up`,`create_time`)";
		    sql += " values('"+title+"','"+cateid+"','"+author+"','"+desc+"','"+image+"','"+content+"','"+link+"','"+pv+"','"+is_up+"','"+getnow()+"');"; 
        }
		
	}
	db.query(sql,function(err,rows,fields){ 
		if(err){
			http.send(res,-1,"error",{});
		}else{
			http.send(res,0,"success",{});	
		}
	});	
	
});

app.post('/deleteArtical', function(req, res, next){ 

	let post = req.body;
	let id = post.id ? post.id : null;  
	let apitype = post.apitype ? post.apitype : 'news'; 
	let tableName =  getTableName(apitype)

	let sql = "delete  from "+tableName+" where id = '"+id+"' ";
	db.query(sql,function(err,rows,fields){ 
		if(err){
			http.send(res,-1,"error",{});
		}else{
			http.send(res,0,"success",{data:rows});	
		}
	});	
	
});


app.post('/delMessage', function(req, res, next){ 

	let post = req.body;
	let id = post.id ? post.id : null;  
	let tabinfo = post.tabinfo; 

	let sql = "delete  from "+tabinfo+" where id = '"+id+"' ";
	db.query(sql,function(err,rows,fields){ 
		if(err){
			http.send(res,-1,"error",{});
		}else{
			http.send(res,0,"success",{data:rows});	
		}
	});	
	
});

app.post('/editMessage', function(req, res, next){ 

	let post = req.body;
	let id = post.id ? post.id : null;  
	let tabinfo = post.tabinfo; 

	let sql = "update  "+tabinfo+" set status=1 where id = '"+id+"' ";
	db.query(sql,function(err,rows,fields){ 
		if(err){
			http.send(res,-1,"error",{});
		}else{
			http.send(res,0,"success",{data:rows});	
		}
	});	
	
});


//
app.post('/getArtical', function(req, res, next){ 
		let post = req.body;
		let keyword = post.keyword ? post.keyword : null;  
		let cateid = post.cateid ? post.cateid : false;  
		let limit = post.limit ? post.limit : '10'; 
        let page = post.page ? post.page : '1'; 
        let apitype = post.apitype ? post.apitype : 'news'; 
		let tableName =  getTableName(apitype)
        let where = " where 1"
		let sql = "select  * from "+tableName;
        let sql2 ="select  count(*) as total from "+tableName
		if(keyword != null){
			where += " and title like '%"+keyword+"%'";
		}
		if(cateid && cateid != -1){
			where += " and cateid = '"+cateid+"'";
		}

		sql += where +" order by create_time desc " +getlimit(page,limit);
        sql2 += where

        db.query(sql2,function(err,rows2,fields){ 
			if(err){
				http.send(res,-1,"error",{});
			}else{
                
                db.query(sql,function(err,rows,fields){ 
                    if(err){
                        http.send(res,-1,"error",{});
                    }else{
                        http.send(res,0,"success",{data:rows,total:rows2});	
                    }
                });	
			}
		});	
		
});

// 查询用户留言
app.post('/getMessage', function(req, res, next){ 
		let post = req.body;
		let keyword = post.keyword ? post.keyword : null;  
		let limit = post.limit ? post.limit : '10'; 
        let page = post.page ? post.page : '1'; 
        let where = " where 1"
		let sql = "select  * from gmcms_userinfo ";
        let sql2 ="select  count(*) as total from gmcms_userinfo "
		if(keyword != null){
			where += " and (name like '%"+keyword+"%' or phone like '%"+keyword+"%' or company like '%"+keyword+"%'  )";
		}

		sql += where +" order by add_time desc " +getlimit(page,limit);
        sql2 += where
        db.query(sql2,function(err,rows2,fields){ 
			if(err){
				http.send(res,-1,"error",{});
			}else{
                
                db.query(sql,function(err,rows,fields){ 
                    if(err){
                        http.send(res,-1,"error",{});
                    }else{
                        http.send(res,0,"success",{data:rows,total:rows2});	
                    }
                });	
			}
		});	
		
});

// 查询文章留言
app.post('/getComment', function(req, res, next){ 
		let post = req.body;
		let keyword = post.keyword ? post.keyword : null;  
		let limit = post.limit ? post.limit : '10'; 
        let page = post.page ? post.page : '1'; 
        let where = " where 1"
		let sql = "select  * from gmcms_comment ";
        let sql2 ="select  count(*) as total from gmcms_comment "
		if(keyword != null){
			where += " and nickname like '%"+keyword+"%'";
		}

		sql += where +" order by add_time desc " +getlimit(page,limit);
        sql2 += where
        db.query(sql2,function(err,rows2,fields){ 
			if(err){
				http.send(res,-1,"error",{});
			}else{
                
                db.query(sql,function(err,rows,fields){ 
                    if(err){
                        http.send(res,-1,"error",{});
                    }else{
                        http.send(res,0,"success",{data:rows,total:rows2});	
                    }
                });	
			}
		});	
		
});


app.post('/getAboutus', function(req, res, next){ 

		let post = req.body;
		let sql = "select  * from gmcms_aboutus where 1  ";
		
		db.query(sql,function(err,rows,fields){ 
			if(err){
				http.send(res,-1,"error",{});
			}else{
				http.send(res,0,"success",{data:rows});	
			}
		});	
});

//资讯
app.post('/aboutusCtl', function(req, res, next){ 

	let post = req.body;
	let company_phone = post.company_phone ? post.company_phone : '';  
	let qrcode = post.qrcode ? post.qrcode : ''; 
	let service_time = post.service_time ? post.service_time : ''; 
	let website = post.website ? post.website : ''; 
	let address = post.address ? post.address : ''; 
	let map_image = post.map_image ? post.map_image : ''; 
	let honr_image = post.honr_image ? post.honr_image : ''; 
	let company_desc = post.company_desc ? post.company_desc : 0; 

	let sql = "";	

	sql += "update `gmcms_aboutus` set `company_phone` = '"+company_phone+"', ";
	sql += " `qrcode` = '"+qrcode+"', ";
	sql += " `service_time` = '"+service_time+"', ";
	sql += " `website` = '"+website+"', ";
	sql += " `address` = '"+address+"', ";
	sql += " `map_image` = '"+map_image+"', ";
	sql += " `honr_image` = '"+honr_image+"', ";
	sql += " `company_desc` = '"+company_desc+"' ";
	sql += " where id = 1 ";

	db.query(sql,function(err,rows,fields){ 
		if(err){
			http.send(res,-1,"error",{});
		}else{
			http.send(res,0,"success",{});	
		}
	});	
	
});


//登录
app.post('/requestLogin', function(req, res, next){ 

	let username  = req.body.data.username;
	let password = req.body.data.password;
	let sql = "select  * from xj_manager where  account = '"+username+"' and password = '"+password+"'   ";

	db.query(sql,function(err,rows,fields){ 
		if(err){
			http.send(res,-1,"error",{});
		}else{
			if(rows.length <= 0){
				http.send(res,-1,"账号或密码错误",{});	
			}else{
				let user = {
					name:rows[0].name,
					kk:rows[0].kk
				};
				http.send(res,0,"登录成功",{data:rows[0]});	

			}
		}
	});	
	// http.send(res,-1,"fail",{data:user});
});

app.get('/postInfo',function (req, res) {
    // 前端提交用户信息
    let post = req.query;
    let name = post.name ;
    let phone = post.phone ;
    let company = post.company ;
    sql =  "insert into  gmcms_userinfo (`name`,`phone`,`company`,`add_time`)";
	sql += " values('"+name+"','"+phone+"','"+company+"','"+getnow()+"');"; 
	db.query(sql,function(err,rows,fields){ 
		if(err){
			http.send(res,-1,"error",{});
		}else{
			http.send(res,0,"success",{});	
		}
	});	
});


app.get('/postCommit',function (req, res) {
    // 前端提交用户信息
    let post = req.query;
    let aid = post.aid ;
    let nickname = post.nickname ;
    let content = post.content ;
    sql =  "insert into  gmcms_comment (`aid`,`nickname`,`content`,`add_time`)";
	sql += " values('"+aid+"','"+nickname+"','"+content+"','"+getnow()+"');"; 
	db.query(sql,function(err,rows,fields){ 
		if(err){
			http.send(res,-1,"error",{});
		}else{
			http.send(res,0,"success",{});	
		}
	});	
});


function writeXls_sample(filename,arr){
	let w = xlsx.utils.aoa_to_sheet(arr);

	let workBook = {
	  SheetNames: ['data'],
	  Sheets: {
	    'data': w
	  }
	};
	xlsx.writeFile(workBook, "./excel/"+filename+".xlsx");
}

function formatDate(_date,addDay = 0) { 

   
	 var timestamp = new Date(_date).getTime();
	 timestamp = timestamp + (86400 * 1000) * addDay;
	 var now = new Date(timestamp);
	 var year=now.getFullYear(); 
     var month=now.getMonth()+1; 
     var date=now.getDate(); 
     var hour=now.getHours(); 
     var minute=now.getMinutes(); 
     var second=now.getSeconds(); 
     String(month).length < 2 ? (month = "0" + month): month;
	 String(date).length < 2 ? (date = "0" + date): date;

	 String(hour).length < 2 ? (hour = "0" + hour): hour;
	 String(minute).length < 2 ? (minute = "0" + minute): minute;
	 String(second).length < 2 ? (second = "0" + second): second;
     var res = year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
     res = year+"-"+month+"-"+date;
	 return res;	
} 


function getnow(){
	 var now = new Date();
	 var year=now.getFullYear(); 
     var month=now.getMonth()+1; 
     var date=now.getDate(); 
     var hour=now.getHours(); 
     var minute=now.getMinutes(); 
     var second=now.getSeconds(); 
     // var res = year+"-"+month+"-"+date;
   	 String(month).length < 2 ? (month = "0" + month): month;
	 String(date).length < 2 ? (date = "0" + date): date;

	 String(hour).length < 2 ? (hour = "0" + hour): hour;
	 String(minute).length < 2 ? (minute = "0" + minute): minute;
	 String(second).length < 2 ? (second = "0" + second): second;

     var res = year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
    
  //    res = year+""+month+""+date;
	 // return res;	

     return res;
}

function base64ToImg(imgData,imgName){
  var base64Data = imgData.replace(/^data:image\/\w+;base64,/, '')
//   var dataBuffer = new Buffer.alloc(base64Data, 'base64')

    let buf;
    if (Buffer.from && Buffer.from !== Uint8Array.from) {
        buf = Buffer.from(base64Data, 'base64');
    } else {
        if (typeof notNumber === 'number') {
            throw new Error('The "size" argument must be not of type number.');
        }
        buf = new Buffer(base64Data, 'base64');
    }
    let url = 'views/assets/upload/images/'+imgName+'.png';
    let url2 = 'assets/upload/images/'+imgName+'.png';
    fs.writeFile(url, buf, function(err) {
        if (err) {
            return err;
        } 
        return url2;
    })
    return url2;
}

 function createRandomId () {
  return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
}
