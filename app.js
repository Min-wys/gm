
var client_service = require("./service/client_service");

//init db pool.
var configs = require("./config/configs");
var db = require('./utils/db');
db.init(configs.mysql());

//从配置文件获取服务器信息
var config = configs.getConfig();

// //--------  HTTP接口服务 ----------//
client_service.start(config);
