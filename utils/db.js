var mysql=require("mysql");  
var crypto = require('./crypto');

var pool = null;

function nop(a,b,c,d,e,f,g){

}
  
function generateUserId() {
    var Id = "";
    for (var i = 0; i < 6; ++i) {
        if (i > 0) {
            Id += Math.floor(Math.random() * 10);
        } else {
            Id += Math.floor(Math.random() * 9) + 1;
        }
    }
    return Id;
}

exports.dosql = function(sql,callback){
    query(sql,function(qerr,vals,fields){  
        //事件驱动回调  
        callback(qerr,vals,fields);  
    });
}

function query(sql,callback){  
    ////console.log("==== test ==="+sql);
    pool.getConnection(function(err,conn){  
        if(err){  
            callback(err,null,null);  
        }else{  
            conn.query(sql,function(qerr,vals,fields){  
                //释放连接  
                conn.release();  
                //事件驱动回调  
                callback(qerr,vals,fields);  
            });  
        }  
    });  
};

exports.init = function(config){
    pool = mysql.createPool({  
        host: config.HOST,
        user: config.USER,
        password: config.PSWD,
        database: config.DB,
        port: config.PORT,
        multipleStatements:true,
        timezone: "08:00"
    });
};

exports.is_account_exist = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(false);
        return;
    }

    var sql = 'SELECT * FROM t_accounts WHERE account = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(false);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(true);
            }
            else{
                callback(false);
            }
        }
    });
};

exports.create_account = function(account,password,callback){
    callback = callback == null? nop:callback;
    if(account == null || password == null){
        callback(false);
        return;
    }

    var psw = crypto.md5(password);
    var sql = 'INSERT INTO t_accounts(account,password) VALUES("' + account + '","' + psw + '")';
    query(sql, function(err, rows, fields) {
        if (err) {
            if(err.code == 'ER_DUP_ENTRY'){
                callback(false);
                return;         
            }
            callback(false);
            throw err;
        }
        else{
            callback(true);            
        }
    });
};


//获取用户生效的房间id
exports.get_all_user_rooms = function(callback){
    callback = callback == null? nop:callback;
 
    var sql = "SELECT distinct(roomid) FROM t_users WHERE roomid > 0 ";
    // var sql = "SELECT id as roomid FROM t_rooms WHERE isOver = 0 ";
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        
        if(rows.length == 0){
            callback(null);
            return;
        }
        
        callback(rows);
    }); 
};



//获取所有的牌友圈
exports.get_all_vip_rooms = function(callback){
    callback = callback == null? nop:callback;
 
    var sql = "SELECT * FROM t_vip_rooms WHERE status = 0 ";
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        
        if(rows.length == 0){
            callback(null);
            return;
        }
        
        callback(rows);
    }); 
};



exports.get_account_info = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }  

    var sql = 'SELECT * FROM t_users WHERE account = "' + account + '"';
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }
        
        if(rows.length == 0){
            callback(null);
            return;
        }
        
        callback(rows[0]);
    }); 
};

exports.is_user_exist = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(false);
        return;
    }

    var sql = 'SELECT `userid` FROM t_users WHERE `account` = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }

        if(rows.length == 0){
            callback(false);
            return;
        }

        callback(true);
    });  
}


exports.get_user_data = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }

    var sql = 'SELECT * FROM t_users WHERE `account` = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        //rows[0].name = crypto.fromBase64(rows[0].name);
        callback(rows[0]);
    });
};

exports.get_user_data_by_userid = function(userid,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(null);
        return;
    }

    var sql = 'SELECT * FROM t_users WHERE `userid` = "' + userid + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        rows[0].name = crypto.fromBase64(rows[0].name);
        callback(rows[0]);
    });
};

//获取用户当前已经加入或者正在申请的牌友圈个数
exports.get_user_viproomNum = function(userId,callback){
    callback = callback == null? nop:callback;
    if(userId == null){
        callback(false);
        return;
    }

    var sql = "SELECT count(*) as vipRoomNum FROM t_vip_apply WHERE `user_id` = '" + userId + "' and status  in (0,1) ";
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(false);
            throw err;
        }
        // console.log("vipRoomNum");
        // console.log(rows);
        if(rows.length == 0){
            callback(false);
            return;
        }
        
        callback(rows[0].vipRoomNum);
    });
};

/**增加玩家房卡 */
exports.add_user_gems = function(userid,gems,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(false);
        return;
    }
    
    var sql = 'UPDATE `t_users` SET `gems` = `gems` +' + gems + ' WHERE `userid` = ' + userid;
    ////console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            //console.log(err);
            callback(false);
            return;
        }
        else{
            callback(rows.affectedRows > 0);
            return; 
        } 
    });
};

exports.get_gems = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }

    var sql = 'SELECT `gems` FROM `t_users` WHERE `account` = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }

        callback(rows[0]);
    });
}; 

exports.get_gems_and_coins = function(account,callback){
    callback = callback == null? nop:callback;
    if(account == null){
        callback(null);
        return;
    }

    var sql = 'SELECT `gems`,`coins`,`c_coin` FROM `t_users` WHERE `account` = "' + account + '"';
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }

        callback(rows[0]);
    });
}

exports.get_user_history = function(userId,callback){
    callback = callback == null? nop:callback;
    if(userId == null){
        callback(null);
        return;
    }

    var sql = "SELECT * FROM `t_rooms` WHERE (`user_id0` = '" + userId + "' or `user_id1` = '" + userId + "' or `user_id2` = '" + userId + "' or `user_id3` = '" + userId + "' or `user_id4` = '" + userId + "' or `user_id5` = '" + userId + "') and isOver != 0 and roundBalance != '' order by create_time desc";
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }

        callback(rows);
  
    });
};


exports.get_user_history_detail = function(roomid,callback){
    callback = callback == null? nop:callback;


    var sql = "SELECT * FROM `t_replay` WHERE roomid = "+roomid;
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }

        callback(rows);
  
    });
};

exports.update_user_history = function(userId,history,callback){
    callback = callback == null? nop:callback;
    if(userId == null || history == null){
        callback(false);
        return;
    }

    history = JSON.stringify(history);
    var sql = 'UPDATE `t_users` SET `roomid` = null, `history` = \'' + history + '\' WHERE `userid` = "' + userId + '"';
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(false);
            throw err;
        }

        if(rows.length == 0){
            callback(false);
            return;
        }

        callback(true);
    });
};

exports.get_games_of_room = function(room_uuid,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null){
        callback(null);
        return;
    }

    var sql = 'SELECT * FROM t_games_archive WHERE `room_uuid` = "' + room_uuid + '"';
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }

        callback(rows);
    });
};

exports.get_detail_of_game = function(room_uuid,index,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null || index == null){
        callback(null);
        return;
    }
    var sql = 'SELECT * FROM t_games_archive WHERE `room_uuid` = "' + room_uuid + '" AND `game_index` = ' + index ;
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            throw err;
        }

        if(rows.length == 0){
            callback(null);
            return;
        }
        callback(rows[0]);
    });
}

exports.create_user = function(account,name,coins,gems,sex,headimg,userType,callback){
    callback = callback == null? nop:callback;
    if(account == null || name == null || coins==null || gems==null){
        callback(false);
        return;
    }
    if(headimg){
        headimg = '"' + headimg + '"';
    }
    else{
        headimg = 'null';
    }
    name = crypto.toBase64(name);
    var userId = generateUserId();

    var sql = 'INSERT INTO t_users(`userid`,`account`,`name`,`coins`,`gems`,`sex`,`headimg`) VALUES("{0}", "{1}","{2}",{3},{4},{5},{6})';
    sql = sql.format(userId,account,name,coins,gems,sex,headimg);
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            callback(null);
            return;
        }
        callback(true);
    });
};

exports.update_user_info = function(userid,name,headimg,sex,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(null);
        return;
    }
 
    if(headimg){
        headimg = '"' + headimg + '"';
    }
    else{
        headimg = 'null';
    }
    name = crypto.toBase64(name);
    var sql = 'UPDATE `t_users` SET `name`="{0}",`headimg`={1},`sex`={2} WHERE `account`="{3}"';
    sql = sql.format(name,headimg,sex,userid);
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        callback(rows);
    });
};

exports.get_user_base_info = function(userid,callback){
    callback = callback == null? nop:callback;
    if(userid == null){
        callback(null);
        return;
    }
    var sql = "SELECT * FROM t_users WHERE `userid`='{0}'";
    sql = sql.format(userid);
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if (err) {
            throw err;
        }
        ////console.log(rows);
        //rows[0].name = crypto.fromBase64(rows[0].name);
        callback(rows[0]);
    });
};

exports.is_room_exist = function(roomId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM `t_rooms` WHERE `id` = "' + roomId + '"';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(rows.length > 0);
        }
    });
};

exports.is_vip_room_exist = function(roomId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM `t_vip_rooms` WHERE `id` = "' + roomId + '"';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(rows.length > 0);
        }
    });
};

exports.cost_gems = function(userid,cost,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE `t_users` SET `gems` = `gems` -' + cost + ' WHERE `userid` = ' + userid;
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(rows.length > 0);
        }
    });
};

exports.set_room_id_of_user = function(userId,roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId != null){
        roomId = '"' + roomId + '"';
    }
    var sql = 'UPDATE `t_users` SET `roomid` = '+ roomId + ' WHERE `userid` = "' + userId + '"';
    ////console.log(sql);
    query(sql, function(err, rows, fields) {
        if(err){
            //console.log(err);
            callback(false);
            throw err;
        }
        else{
            callback(rows.length > 0);
        }
    });
};




exports.get_room_id_of_user = function(userId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT `roomid` FROM t_users as user left join `t_rooms` as rooms on user.roomid = rooms.id WHERE user.userid = "' + userId + '" and rooms.isOver = 0';
    console.log(sql);
    query(sql, function(err, rows, fields) {
        if(err){
            callback(null);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(rows[0].roomid);
            }
            else{
                callback(null);
            }
        }
    });
};


exports.create_room = function(roomInfo,callback){
    ////console.log(JSON.stringify(roomInfo));
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO `t_rooms`(`uuid`, `id`, `creator`,`gems`,`type`,`cid`,`c_creator`, `gameNum`, `playerNum`, `cat`, `ma`, `payType`, `gameType`, `proxyRoom`, `shot`, `ipCheck`, `locationCheck`,`create_time`)\
                VALUES('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}','{9}','{10}','{11}','{12}','{13}','{14}','{15}','{16}','{17}')";
    var uuid = Date.now() + roomInfo.id;
    ////console.log(roomInfo.locationCheck);
    ////console.log(roomInfo.create_time);
    sql = sql.format(uuid,roomInfo.id,roomInfo.creator,roomInfo.gems,roomInfo.type,roomInfo.cid,roomInfo.c_creator,roomInfo.gameNum,roomInfo.playerNum,roomInfo.cat,roomInfo.ma,roomInfo.payType,roomInfo.gameType,roomInfo.proxyRoom,roomInfo.shot,roomInfo.ipCheck,roomInfo.locationCheck,roomInfo.create_time);
    ////console.log("creat_room sql is "+sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(uuid);
        }
    });
};

exports.create_vip_room_apply = function(roomInfo,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO `t_vip_rooms`(`uuid`, `id`, `creator`, `playerNum`, `status`,`create_time`)\
                VALUES('{0}','{1}','{2}','{3}',{4},'{5}')";
    var uuid = Date.now() + roomInfo.id;
  
    sql = sql.format(uuid,roomInfo.id,roomInfo.creator,roomInfo.playerNum,roomInfo.status,roomInfo.create_time);
    //console.log("creat_vip_room sql is "+sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(uuid);
        }
    });
};

exports.create_vip_room = function(roomInfo,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO `t_vip_rooms`(`uuid`, `id`, `creator`, `playerNum`, `status`,`create_time`)\
                VALUES('{0}','{1}','{2}','{3}',{4},'{5}')";
    var uuid = Date.now() + roomInfo.id;
  
    sql = sql.format(uuid,roomInfo.id,roomInfo.creator,roomInfo.playerNum,roomInfo.status,roomInfo.create_time);
    //console.log("creat_vip_room sql is "+sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(uuid);
        }
    });
};

exports.apply_vip_room = function(info,callback){
    callback = callback == null? nop:callback;

    var sql = "select * from `t_vip_apply` where vipRoomId = '"+info.vipRoomId+"'  and user_id = '"+info.user_id+"' and status = 0";
    query(sql,function(err,rows,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            if(rows.length > 0){ //已经有过申请记录
                callback(true);
            }else{
                var sql = "INSERT INTO `t_vip_apply`(`vipRoomId`,`creator`, `user_id`, `user_name`, `user_icon`,`status`,`create_time`)\
                            VALUES('{0}','{1}','{2}','{3}','{4}','{5}','{6}')";
              
              
                sql = sql.format(info.vipRoomId,info.creator,info.user_id,info.user_name,info.user_icon,info.status,info.create_time);
                //console.log("apply_vip_room sql is "+sql);
                query(sql,function(err,row,fields){
                    if(err){
                        callback(null);
                        throw err;
                    }
                    else{
                        callback(true);
                    }
                });
            }

            
        }
    });



};




exports.get_vip_room = function(roomId,callback){


    callback = callback == null? nop:callback;
    var sql = "SELECT * FROM t_vip_rooms WHERE id = '" + roomId + "'";
    query(sql,function(err,rows,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(rows[0]);
        }
    });


};




exports.get_room_uuid = function(roomId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT uuid FROM t_rooms WHERE id = "' + roomId + '"';
    query(sql,function(err,rows,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(rows[0].uuid);
        }
    });
};

exports.get_roomInfo_of_roomid = function(roomId,need_fields,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT '+need_fields+' FROM t_rooms WHERE `id` = "' + roomId + '"';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(null);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(rows[0]);
            }
            else{
                callback(null);
            }
        }
    });
};

//检查某个用户在某个房间内是否合法
exports.checkUserRightOfRoomid = function(userId,roomId,callback){
    callback = callback == null? nop:callback;
    var sql = 'SELECT * FROM t_rooms WHERE `id` = "' + roomId + '"';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(null);
            throw err;
        }
        else{
            if(rows.length > 0){
              
                let res = null;
                if(userId == rows[0]['user_id0']){
                    res = true;
                }
                if(userId == rows[0]['user_id1']){
                    res = true;
                }
                if(userId == rows[0]['user_id2']){
                    res = true;
                }
                if(userId == rows[0]['user_id3']){
                    res = true;
                }
                if(userId == rows[0]['user_id4']){
                    res = true;
                }
                if(userId == rows[0]['user_id5']){
                    res = true;
                }
                callback(res);
            }
            else{
                callback(null);
            }
        }
    });


}

//TODO 事物处理
exports.quitVipRoom = function(info,callback){
    callback = callback == null? nop:callback;
    var userId = info.user_id;
    var sql = "UPDATE t_vip_apply SET status = 3 WHERE user_id = '"+userId+"' and  vipRoomId = '"+info.vipRoomId+"'";
    //name = crypto.toBase64(name);
    //sql = sql.format(userId,info.vipRoomId);
    console.log(sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{

            var sql = "INSERT INTO `t_vip_quit`(`vipRoomId`, `user_id`, `user_name`, `user_icon`,`status`,`create_time`)\
                VALUES('{0}','{1}','{2}','{3}',{4},'{5}')";
  
  
            sql = sql.format(info.vipRoomId,info.user_id,info.user_name,info.user_icon,info.status,info.create_time);
            //console.log("creat_vip_room sql is "+sql);
            query(sql,function(err,row,fields){
                if(err){
                    callback(null);
                    throw err;
                }
                else{
                    callback(true);
                }
            });

            
        }
    });
}

exports.update_seat_info = function(roomId,seatIndex,userId,name,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_rooms SET user_id{0} = {1},user_name{0} = "{2}" WHERE id = "{3}"';
    //name = crypto.toBase64(name);
    sql = sql.format(seatIndex,userId,name,roomId);
    ////console.log(sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
}

exports.update_user_roomId = function(roomId,userId){

    var sql = 'UPDATE t_users SET roomid = {0} WHERE userid = "{1}"';
    //name = crypto.toBase64(name);
    sql = sql.format(roomId,userId);
    ////console.log(sql);
    query(sql,function(err,row,fields){
        if(err){
            
            throw err;
        }
        else{
            return true;
        }
    });
}



exports.update_num_of_turns = function(roomId,numOfTurns,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_rooms SET num_of_turns = {0} WHERE id = "{1}"'
    sql = sql.format(numOfTurns,roomId);
    ////console.log(sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};


exports.update_next_button = function(roomId,nextButton,callback){
    callback = callback == null? nop:callback;
    var sql = 'UPDATE t_rooms SET next_button = {0} WHERE id = "{1}"'
    sql = sql.format(nextButton,roomId);
    ////console.log(sql);
    query(sql,function(err,row,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

exports.get_room_addr = function(roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId == null){
        callback(false,null,null);
        return;
    }

    var sql = 'SELECT ip,port FROM t_rooms WHERE id = "' + roomId + '"';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false,null,null);
            throw err;
        }
        if(rows.length > 0){
            callback(true,rows[0].ip,rows[0].port);
        }
        else{
            callback(false,null,null);
        }
    });
};

exports.get_room_data = function(roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId == null){
        callback(null);
        return;
    }

    var sql = 'SELECT * FROM t_rooms WHERE id = "' + roomId + '"';
    query(sql, function(err, rows, fields) {
        if(err){
            callback(null);
            throw err;
        }
        if(rows.length > 0){
            // rows[0].user_name0 = crypto.fromBase64(rows[0].user_name0);
            // rows[0].user_name1 = crypto.fromBase64(rows[0].user_name1);
            // rows[0].user_name2 = crypto.fromBase64(rows[0].user_name2);
            // rows[0].user_name3 = crypto.fromBase64(rows[0].user_name3);
            callback(rows[0]);
        }
        else{
            callback(null);
        }
    });
};

exports.delete_room = function(roomId,callback){
    callback = callback == null? nop:callback;
    if(roomId == null){
        callback(false);
    }
    var sql = "DELETE FROM t_rooms WHERE id = '{0}'";
    sql = sql.format(roomId);
    //console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
}

exports.create_game = function(room_uuid,index,base_info,callback){
    callback = callback == null? nop:callback;
    var sql = "INSERT INTO t_games(room_uuid,game_index,base_info,create_time) VALUES('{0}',{1},'{2}',unix_timestamp(now()))";
    sql = sql.format(room_uuid,index,base_info);
    ////console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(null);
            throw err;
        }
        else{
            callback(rows.insertId);
        }
    });
};

exports.delete_games = function(room_uuid,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null){
        callback(false);
    }    
    var sql = "DELETE FROM t_games WHERE room_uuid = '{0}'";
    sql = sql.format(room_uuid);
    //console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
}

exports.archive_games = function(room_uuid,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null){
        callback(false);
    }
    var sql = "INSERT INTO t_games_archive(SELECT * FROM t_games WHERE room_uuid = '{0}')";
    sql = sql.format(room_uuid);
    //console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            exports.delete_games(room_uuid,function(ret){
                callback(ret);
            });
        }
    });
}

exports.update_game_action_records = function(room_uuid,index,actions,callback){
    callback = callback == null? nop:callback;
    var sql = "UPDATE t_games SET action_records = '"+ actions +"' WHERE room_uuid = '" + room_uuid + "' AND game_index = " + index ;
    ////console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

exports.update_game_result = function(room_uuid,index,result,callback){
    callback = callback == null? nop:callback;
    if(room_uuid == null || result){
        callback(false);
    }
    
    result = JSON.stringify(result);
    var sql = "UPDATE t_games SET result = '"+ result +"' WHERE room_uuid = '" + room_uuid + "' AND game_index = " + index ;
    ////console.log(sql);
    query(sql,function(err,rows,fields){
        if(err){
            callback(false);
            throw err;
        }
        else{
            callback(true);
        }
    });
};

exports.get_message = function(type,version,callback){
    callback = callback == null? nop:callback;
    
    var sql = 'SELECT * FROM t_message WHERE type = "'+ type + '"';
    
    if(version == "null"){
        version = null;
    }
    
    if(version){
        version = '"' + version + '"';
        sql += ' AND version != ' + version;   
    }
     
    query(sql, function(err, rows, fields) {
        if(err){
            callback(false);
            throw err;
        }
        else{
            if(rows.length > 0){
                callback(rows[0]);    
            }
            else{
                callback(null);
            }
        }
    });
};

exports.query = query;