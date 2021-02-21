var SERVER_IP = "127.0.0.1";//如果非本机访问，这里要变
var SERVER_PORT = 8443;
var ACCOUNT_PRI_KEY = "^&*#$%()@";  //md5加盐
//var ROOM_PRI_KEY = "~!@#$(*&^%$&";  //md5加盐
var VERSION = "20190708";
var LOCAL_IP = 'localhost';

exports.mysql = function(){
	return {
		HOST:'127.0.0.1',
		USER:'root',
		PSWD:'rootpassword',//如果连接失败，请检查这里
		DB:'gm_cms',//如果连接失败，请检查这里
		PORT:3306,
	}
}

//账号服配置
exports.getConfig = function(){
	return {
		SERVER_PORT:SERVER_PORT,
		SERVER_IP:SERVER_IP,
		VERSION:VERSION
	};
};



