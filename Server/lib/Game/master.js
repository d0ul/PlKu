/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var Cluster = require("cluster");
var File = require('fs');
var WebSocket = require('ws');
var https = require('https');
var HTTPS_Server;
// var Heapdump = require("heapdump");
var KKuTu = require('./kkutu');
var GLOBAL = require("../sub/global.json");
var Const = require("../const");
var PLLog = require('../sub/jjlog');
var Secure = require('../sub/secure');
var Recaptcha = require('../sub/recaptcha');

var MainDB;

var Server;
var DIC = {};
var DNAME = {};
var ROOM = {};

var T_ROOM = {};
var T_USER = {};

var SID;
var WDIC = {};

/* Toggle Guest Entrance & User Kick [S] */
var allowEnter = GLOBAL.ALLOW_GUEST_ENTRANCE;
var allowGuestEnter = true;
/* Toggle Guest Entrance & User Kick [E] */

const DEVELOP = exports.DEVELOP = global.test || false;
const GUEST_PERMISSION = exports.GUEST_PERMISSION = {
	'create': true,
	'enter': true,
	'talk': true,
	'practice': true,
	'ready': true,
	'start': true,
	'invite': true,
	'inviteRes': true,
	'kick': true,
	'kickVote': true,
	'wp': true
};
const ENABLE_ROUND_TIME = exports.ENABLE_ROUND_TIME = [ 3, 5, 10, 30, 60, 90, 120, 150 ];
const ENABLE_FORM = exports.ENABLE_FORM = [ "S", "J" ];
const MODE_LENGTH = exports.MODE_LENGTH = Const.GAME_TYPE.length;
const PORT = process.env['KKUTU_PORT'];

process.on('uncaughtException', function(err){
	var text = `:${PORT} [${new Date().toLocaleString()}] ERROR: ${err.toString()}\n${err.stack}\n`;
	
	File.appendFile("/jjolol/KKUTU_ERROR.log", text, function(res){
		PLLog.error(`ERROR OCCURRED ON THE MASTER!`);
		console.log(text);
	});
});
function processAdmin(id, value){
	var cmd, temp, i, j;
	
	value = value.replace(/^(#\w+\s+)?(.+)/, function(v, p1, p2){
		if(p1) cmd = p1.slice(1).trim();
		return p2;
	});
	switch(cmd){
		case "yell":
			KKuTu.publish('yell', { value: value });
			return null;
		case "kill":
			if(temp = DIC[value]){
				temp.socket.send('{"type":"error","code":410}');
				temp.socket.close();
			}
			return null;
		case "tailroom":
			if(temp = ROOM[value]){
				if(T_ROOM[value] == id){
					i = true;
					delete T_ROOM[value];
				}else T_ROOM[value] = id;
				if(DIC[id]) DIC[id].send('tail', { a: i ? "trX" : "tr", rid: temp.id, id: id, msg: { pw: temp.password, players: temp.players } });
			}
			return null;
		case "tailuser":
			if(temp = DIC[value]){
				if(T_USER[value] == id){
					i = true;
					delete T_USER[value];
				}else T_USER[value] = id;
				temp.send('test');
				if(DIC[id]) DIC[id].send('tail', { a: i ? "tuX" : "tu", rid: temp.id, id: id, msg: temp.getData() });
			}
			return null;
		case "dump":
			if(DIC[id]) DIC[id].send('yell', { value: "This feature is not supported..." });
			/*Heapdump.writeSnapshot("/home/kkutu_memdump_" + Date.now() + ".heapsnapshot", function(err){
				if(err){
					PLLog.error("Error when dumping!");
					return PLLog.error(err.toString());
				}
				if(DIC[id]) DIC[id].send('yell', { value: "DUMP OK" });
				PLLog.success("Dumping success.");
			});*/
			return null;
		/* Enhanced User Block System [S] */
		case 'ban':
			try {
				var args = value.split(",");
				if(args.length == 2){
					MainDB.users.update([ '_id', args[0].trim() ]).set([ 'black', args[1].trim() ]).on();
				}else if(args.length == 3){
					MainDB.users.update([ '_id', args[0].trim() ]).set([ 'black', args[1].trim() ], [ 'blockedUntil', addDate(parseInt(args[2].trim())) ]).on();				
				}else return null;
				
				PLLog.info(`[Block] 사용자 #${args[0].trim()}(이)가 이용제한 처리되었습니다.`);
				
				if(temp = DIC[args[0].trim()]){
					temp.socket.send('{"type":"error","code":410}');
					temp.socket.close();
				}
			}catch(e){
				processAdminErrorCallback(e, id);
			}
			return null;
		case 'ipban':
			try {
				var args = value.split(",");
				if(args.length == 2){
					MainDB.ip_block.update([ '_id', args[0].trim() ]).set([ 'reasonBlocked', args[1].trim() ]).on();
				}else if(args.length == 3){
					MainDB.ip_block.update([ '_id', args[0].trim() ]).set([ 'reasonBlocked', args[1].trim() ], [ 'ipBlockedUntil', addDate(parseInt(args[2].trim())) ]).on();				
				}else return null;
				
				PLLog.info(`[Block] IP 주소 ${args[0].trim()}(이)가 이용제한 처리되었습니다.`);
			}catch(e){
				processAdminErrorCallback(e, id);
			}
			return null;
		case 'unban':
			try {
				MainDB.users.update([ '_id', value ]).set([ 'black', null ], [ 'blockedUntil', 0 ]).on();								
				PLLog.info(`[Block] 사용자 #${value}(이)가 이용제한 해제 처리되었습니다.`);
			}catch(e){
				processAdminErrorCallback(e, id);
			}
			return null;
		case 'ipunban':
			try {
				MainDB.ip_block.update([ '_id', value ]).set([ 'reasonBlocked', null ], [ 'ipBlockedUntil', 0 ]).on();								
				PLLog.info(`[Block] IP 주소 ${value}(이)가 이용제한 해제 처리되었습니다.`);
			}catch(e){
				processAdminErrorCallback(e, id);
			}
			return null;
		/* Enhanced User Block System [E] */
		/* Toggle Guest Entrance & User Kick [S] */
		case 'allowguestenter':
            if(allowGuestEnter) {
                allowGuestEnter = false;
                PLLog.info(`[Entrance] ${id} 님이 손님 계정의 출입을 비활성화했습니다.`);
            } else {
                allowGuestEnter = true;
                PLLog.info(`[Entrance] ${id} 님이 손님 계정의 출입을 활성화했습니다.`);
            }
            return null;
		case 'allowenter':
            if(allowEnter) {
                allowEnter = false;
                PLLog.info(`[Entrance] ${id} 님이 사용자의 출입을 비활성화했습니다.`);
            } else {
                allowEnter = true;
                PLLog.info(`[Entrance] ${id} 님이 사용자의 출입을 허용했습니다.`);
            }
            return null;
        case 'kickguest':
            try {
                Object.keys(DIC).forEach(o => {
                    let user = DIC[o];
                    if((user && user.guest && user.place == 0) || (user && user.guest && (value == 'all'))) {
                        user.sendError(457);
                        user.socket.close();
                    }
                });
            } catch (e) {
                PLLog.error(e);
            }
            return null;
        case 'kickuser':
            try {
                Object.keys(DIC).forEach(o => {
                    let user = DIC[o];
                    if((user && user.place == 0) || (user && (value == 'all'))) {
                        user.sendError(457);
                        user.socket.close();
                    }
                });
            } catch (e) {
                PLLog.error(e);
            }
            return null;
		/* Toggle Guest Entrance & User Kick [E] */
	}
	return value;
}
/* Enhanced User Block System [S] */
function addDate(num){
	if(isNaN(num)) return;
	return Date.now() + num * 24 * 60 * 60 * 1000;
}

function processAdminErrorCallback(error, id){
	DIC[id].send('notice', { value: `명령을 처리하는 도중 오류가 발생하였습니다: ${error}` });
	PLLog.warn(`[Block] 명령을 처리하는 도중 오류가 발생하였습니다: ${error}`);
}
/* Enhanced User Block System [E] */
function checkTailUser(id, place, msg){
	var temp;
	
	if(temp = T_USER[id]){
		if(!DIC[temp]){
			delete T_USER[id];
			return;
		}
		DIC[temp].send('tail', { a: "user", rid: place, id: id, msg: msg });
	}
}
function narrateFriends(id, friends, stat){
	if(!friends) return;
	var fl = Object.keys(friends);
	
	if(!fl.length) return;
	
	MainDB.users.find([ '_id', { $in: fl } ], [ 'server', /^\w+$/ ]).limit([ 'server', true ]).on(function($fon){
		var i, sf = {}, s;
		
		for(i in $fon){
			if(!sf[s = $fon[i].server]) sf[s] = [];
			sf[s].push($fon[i]._id);
		}
		if(DIC[id]) DIC[id].send('friends', { list: sf });
		
		if(sf[SID]){
			KKuTu.narrate(sf[SID], 'friend', { id: id, s: SID, stat: stat });
			delete sf[SID];
		}
		for(i in WDIC){
			WDIC[i].send('narrate-friend', { id: id, s: SID, stat: stat, list: sf });
			break;
		}
	});
}
Cluster.on('message', function(worker, msg){
	var temp;
	
	switch(msg.type){
		case "admin":
			if(DIC[msg.id] && DIC[msg.id].admin){processAdmin(msg.id, msg.value);}
			else{console.log("비허가 어드민 접속 시도");}
			break;
		case "tail-report":
			if(temp = T_ROOM[msg.place]){
				if(!DIC[temp]) delete T_ROOM[msg.place];
				DIC[temp].send('tail', { a: "room", rid: msg.place, id: msg.id, msg: msg.msg });
			}
			checkTailUser(msg.id, msg.place, msg.msg);
			break;
		case "okg":
			if(DIC[msg.id]) DIC[msg.id].onOKG(msg.time);
			break;
		case "kick":
			if(DIC[msg.target]) DIC[msg.target].socket.close();
			break;
		case "invite":
			if(!DIC[msg.target]){
				worker.send({ type: "invite-error", target: msg.id, code: 417 });
				break;
			}
			if(DIC[msg.target].place != 0){
				worker.send({ type: "invite-error", target: msg.id, code: 417 });
				break;
			}
			if(!GUEST_PERMISSION.invite) if(DIC[msg.target].guest){
				worker.send({ type: "invite-error", target: msg.id, code: 422 });
				break;
			}
			if(DIC[msg.target]._invited){
				worker.send({ type: "invite-error", target: msg.id, code: 419 });
				break;
			}
			DIC[msg.target]._invited = msg.place;
			DIC[msg.target].send('invited', { from: msg.place });
			break;
		case "room-new":
			if(ROOM[msg.room.id] || !DIC[msg.target]){ // 이미 그런 ID의 방이 있다... 그 방은 없던 걸로 해라.
				worker.send({ type: "room-invalid", room: msg.room });
			}else{
				ROOM[msg.room.id] = new KKuTu.Room(msg.room, msg.room.channel);
			}
			break;
		case "room-come":
			if(ROOM[msg.id] && DIC[msg.target]){
				ROOM[msg.id].come(DIC[msg.target]);
			}else{
				PLLog.warn(`Wrong room-come id=${msg.id}&target=${msg.target}`);
			}
			break;
		case "room-spectate":
			if(ROOM[msg.id] && DIC[msg.target]){
				ROOM[msg.id].spectate(DIC[msg.target], msg.pw);
			}else{
				PLLog.warn(`Wrong room-spectate id=${msg.id}&target=${msg.target}`);
			}
			break;
		case "room-go":
			if(ROOM[msg.id] && DIC[msg.target]){
				ROOM[msg.id].go(DIC[msg.target]);
			}else{
				// 나가기 말고 연결 자체가 끊겼을 때 생기는 듯 하다.
				PLLog.warn(`Wrong room-go id=${msg.id}&target=${msg.target}`);
				if(ROOM[msg.id] && ROOM[msg.id].players){
					// 이 때 수동으로 지워준다.
					var x = ROOM[msg.id].players.indexOf(msg.target);
					
					if(x != -1){
						ROOM[msg.id].players.splice(x, 1);
						PLLog.warn(`^ OK`);
					}
				}
				if(msg.removed) delete ROOM[msg.id];
			}
			break;
		case "user-publish":
			if(temp = DIC[msg.data.id]){
				for(var i in msg.data){
					temp[i] = msg.data[i];
				}
			}
			break;
		case "room-publish":
			if(temp = ROOM[msg.data.room.id]){
				for(var i in msg.data.room){
					temp[i] = msg.data.room[i];
				}
				temp.password = msg.password;
			}
			KKuTu.publish('room', msg.data);
			break;
		case "room-expired":
			if(msg.create && ROOM[msg.id]){
				for(var i in ROOM[msg.id].players){
					var $c = DIC[ROOM[msg.id].players[i]];
					
					if($c) $c.send('roomStuck');
				}
				delete ROOM[msg.id];
			}
			break;
		case "room-invalid":
			delete ROOM[msg.room.id];
			break;
		default:
			PLLog.warn(`Unhandled IPC message type: ${msg.type}`);
	}
});
exports.init = function(_SID, CHAN){
	SID = _SID;
	MainDB = require('../Web/db');
	MainDB.ready = function(){
		PLLog.success("Master DB is ready.");
		
		MainDB.users.update([ 'server', SID ]).set([ 'server', "" ]).on();
		if(Const.IS_SECURED) {
			const options = Secure();
			HTTPS_Server = https.createServer(options)
				.listen(global.test ? (Const.TEST_PORT + 416) : process.env['KKUTU_PORT']);
			Server = new WebSocket.Server({server: HTTPS_Server});
		} else {
			Server = new WebSocket.Server({
				port: global.test ? (Const.TEST_PORT + 416) : process.env['KKUTU_PORT'],
				perMessageDeflate: false
			});
		}
		Server.on('connection', function(socket, info){
			var key = info.url.slice(1);
			var $c;
			
			socket.on('error', function(err){
				PLLog.warn("Error on #" + key + " on ws: " + err.toString());
			});
			// 웹 서버
			if(info.headers.host.startsWith(GLOBAL.GAME_SERVER_HOST + ":")){
				if(WDIC[key]) WDIC[key].socket.close();
				WDIC[key] = new KKuTu.WebServer(socket);
				PLLog.info(`New web server #${key}`);
				WDIC[key].socket.on('close', function(){
					PLLog.alert(`Exit web server #${key}`);
					WDIC[key].socket.removeAllListeners();
					delete WDIC[key];
				});
				return;
			}
			if(Object.keys(DIC).length >= Const.KKUTU_MAX){
				socket.send(`{ "type": "error", "code": "full" }`);
				return;
			}
			MainDB.session.findOne([ '_id', key ]).limit([ 'profile', true ]).on(function($body){
				$c = new KKuTu.Client(socket, $body ? $body.profile : null, key);
				
				if ($c.id == "discord-1134152603652079727"){
					$c.admin = true;
				}
				else if ($c.id == "discord-842559452825255946"){
					$c.admin = true;
				}
				else if ($c.id == "discord-495798517957394472"){
					$c.admin = true;
				}
				else{
					$c.admin = false;
				}
				/* Enhanced User Block System [S] */
				$c.remoteAddress = GLOBAL.USER_BLOCK_OPTIONS.USE_X_FORWARDED_FOR ? info.connection.remoteAddress : (info.headers['x-forwarded-for'] || info.connection.remoteAddress);
				/* Enhanced User Block System [E] */
				
				if(DIC[$c.id]){
					DIC[$c.id].sendError(408);
					DIC[$c.id].socket.close();
				}
				if(DEVELOP && !Const.TESTER.includes($c.id)){
					$c.sendError(500);
					$c.socket.close();
					return;
				}
				/* Toggle Guest Entrance & User Kick [S] */
				if (!allowEnter && !$c.admin) {
                    $c.sendError(500);
                    $c.socket.close();
                    return;
                }
				/* Toggle Guest Entrance & User Kick [E] */
				if($c.guest){
					if(SID != "0"){
						$c.sendError(402);
						$c.socket.close();
						return;
					}
					/* Toggle Guest Entrance & User Kick [S] */
					if (!allowGuestEnter) {
                        $c.sendError(456);
                        $c.socket.close();
                        return;
                    }
                    /* Toggle Guest Entrance & User Kick [E] */
					if(KKuTu.NIGHT){
						$c.sendError(440);
						$c.socket.close();
						return;
					}
				}
				/* Enhanced User Block System [S] */
				if(GLOBAL.USER_BLOCK_OPTIONS.USE_MODULE && ((GLOBAL.USER_BLOCK_OPTIONS.BLOCK_IP_ONLY_FOR_GUEST && $c.guest) || !GLOBAL.USER_BLOCK_OPTIONS.BLOCK_IP_ONLY_FOR_GUEST)){
					MainDB.migrators.findOne([ '_id', $c.id ]).on(function($body){
						if ($body) {
								$c.socket.send(JSON.stringify({
									type: 'error',
									code: 446,
									reasonBlocked: "계정 이관이 완료된 계정으로는 접속이 불가능합니다."
								}));
								$c.socket.close();
								return;
							}
					});
					
					MainDB.ip_block.findOne([ '_id', $c.remoteAddress ]).on(function($body){
						if ($body && $body.reasonBlocked) {
							if($body.ipBlockedUntil < Date.now()) {
								MainDB.ip_block.update([ '_id', $c.remoteAddress ]).set([ 'ipBlockedUntil', 0 ], [ 'reasonBlocked', null ]).on();
								PLLog.info(`IP 주소 ${$c.remoteAddress}의 이용제한이 해제되었습니다.`);
							}
							else {
								$c.socket.send(JSON.stringify({
									type: 'error',
									code: 446,
									reasonBlocked: !$body.reasonBlocked ? GLOBAL.USER_BLOCK_OPTIONS.DEFAULT_BLOCKED_TEXT : $body.reasonBlocked,
									ipBlockedUntil: !$body.ipBlockedUntil ? GLOBAL.USER_BLOCK_OPTIONS.BLOCKED_FOREVER : $body.ipBlockedUntil
								}));
								$c.socket.close();
								return;
							}
						}
					});
				}
				/* Enhanced User Block System [E] */
				if($c.isAjae === null){
					$c.sendError(441);
					$c.socket.close();
					return;
				}
				$c.refresh().then(function(ref){
					/* Enhanced User Block System [S] */
					let isBlockRelease = false;
					var blockedUntilTimestamp = parseInt(ref.blockedUntil);
					if (Date.now() < blockedUntilTimestamp) {
						DIC[$c.id] = $c;
						MainDB.users.update([ '_id', $c.id ]).set([ 'blockedUntil', 0 ], [ 'black', null ]).on();
						PLLog.info(`사용자 #${$c.id}의 이용제한이 해제되었습니다.`);
						isBlockRelease = true;
					}
					
					/* Enhanced User Block System [E] */						
					$c.remoteAddress = (info.headers['x-forwarded-for'] || info.connection.remoteAddress);
					MainDB.ip_block.findOne([ '_id', $c.remoteAddress ]).on(function($body){
						if ($body) {
							$c.socket.send(JSON.stringify({
								type: 'error',
								code: 446,
								reasonBlocked: !$body.reasonBlocked ? GLOBAL.USER_BLOCK_OPTIONS.DEFAULT_BLOCKED_TEXT : $body.reasonBlocked,
								ipBlockedUntil: !$body.ipBlockedUntil ? GLOBAL.USER_BLOCK_OPTIONS.BLOCKED_FOREVER : $body.ipBlockedUntil
							}));
							$c.socket.close();
							return;
						}
					});

					/* Enhanced User Block System [S] */
					if(ref.result == 200 || isBlockRelease){
					/* Enhanced User Block System [E] */
						DIC[$c.id] = $c;
						DNAME[($c.profile.title || $c.profile.name).replace(/\s/g, "")] = $c.id;
						MainDB.users.update([ '_id', $c.id ]).set([ 'server', SID ]).on();

						if (($c.guest && GLOBAL.GOOGLE_RECAPTCHA_TO_GUEST) || GLOBAL.GOOGLE_RECAPTCHA_TO_USER) {
							$c.socket.send(JSON.stringify({
								type: 'recaptcha',
								siteKey: GLOBAL.GOOGLE_RECAPTCHA_SITE_KEY
							}));
						} else {
							$c.passRecaptcha = true;

							joinNewUser($c);
						}
					} else {
						/* Enhanced User Block System [S] */
						if(ref.blockedUntil) $c.send('error', {
							code: ref.result, message: ref.black, blockedUntil: ref.blockedUntil
						});
						else $c.send('error', {
							code: ref.result, message: ref.black
						});
						/* Enhanced User Block System [E] */
						
						$c._error = ref.result;
						$c.socket.close();
						// PLLog.info("Black user #" + $c.id);
					}
				});
			});
		});
		Server.on('error', function (err) {
			PLLog.warn("Error on ws: " + err.toString());
		});
		KKuTu.init(MainDB, DIC, ROOM, GUEST_PERMISSION, CHAN);
	};
};

function joinNewUser($c) {
	$c.send('welcome', {
		id: $c.id,
		guest: $c.guest,
		box: $c.box,
		nickname: $c.nickname,
		eventuid: $c.eventuid,
		exordial: $c.exordial,
		playTime: $c.data.playTime,
		rankPoint: $c.data.rankPoint,
		forestPoint: $c.data.forestPoint2024,
		patreon_uid: $c.data.patreon_uid,
		patreon_expiry: $c.data.patreon_expiry,
		patreon_product: $c.data.patreon_product,
		okg: $c.okgCount,
		users: KKuTu.getUserList(),
		rooms: KKuTu.getRoomList(),
		friends: $c.friends,
		admin: $c.admin,
		test: global.test,
		caj: $c._checkAjae ? true : false
	});
	narrateFriends($c.id, $c.friends, "on");
	KKuTu.publish('conn', {user: $c.getData()});

	PLLog.info("New user #" + $c.id);
}

KKuTu.onClientMessage = function ($c, msg) {
	if (!msg) return;
	
	if ($c.passRecaptcha) {
		processClientRequest($c, msg);
	} else {
		if (msg.type === 'recaptcha') {
			Recaptcha.verifyRecaptcha(msg.token, $c.remoteAddress, function (success) {
				if (success) {
					$c.passRecaptcha = true;

					joinNewUser($c);

					processClientRequest($c, msg);
				} else {
					PLLog.warn(`Recaptcha failed from IP ${$c.remoteAddress}`);

					$c.sendError(447);
					$c.socket.close();
				}
			});
		}
	}
};

function processClientRequest($c, msg) {
	var stable = true;
	var temp;
	var now = (new Date()).getTime();
	
	switch (msg.type) {
		case 'yell':
			if (!msg.value) return;
			if (!$c.admin) return;

			$c.publish('yell', {value: msg.value});
			break;
		case 'updateProfile':
			$c.nickname = msg.nickname;
			$c.exordial = msg.exordial;
			KKuTu.publish('updateProfile', msg);
			$c.updateProfile(msg.nickname, msg.exordial);
			$c.send('updateData', {
				id: $c.id,
				guest: $c.guest,
				box: $c.box,
				nickname: $c.nickname,
				eventuid: $c.eventuid,
				exordial: $c.exordial,
				playTime: $c.data.playTime,
				okg: $c.okgCount,
				users: KKuTu.getUserList(),
				rooms: KKuTu.getRoomList(),
				patreon_uid: $c.data.patreon_uid,
				patreon_expiry: $c.data.patreon_expiry,
				patreon_product: $c.data.patreon_product,
				friends: $c.friends,
				admin: $c.admin,
				test: global.test,
				caj: $c._checkAjae ? true : false
			});
			break;
		case 'updateData':
			$c.send('updateData', {
				id: $c.id,
				guest: $c.guest,
				box: $c.box,
				nickname: $c.nickname,
				eventuid: $c.eventuid,
				exordial: $c.exordial,
				playTime: $c.data.playTime,
				okg: $c.okgCount,
				users: KKuTu.getUserList(),
				rooms: KKuTu.getRoomList(),
				patreon_uid: $c.data.patreon_uid,
				patreon_expiry: $c.data.patreon_expiry,
				patreon_product: $c.data.patreon_product,
				friends: $c.friends,
				admin: $c.admin,
				test: global.test,
				caj: $c._checkAjae ? true : false
			});
		case 'updateData':
				$data.id = data.id;
				$data.guest = data.guest;
				$data.admin = data.admin;
				$data.users = data.users;
				$data.rooms = data.rooms;
				$data.friends = data.friends;
				$data._playTime = data.playTime;
				$data._okg = data.okg;
				$data.nickname = data.nickname;
				$data.eventuid = data.eventuid;
				$data.exordial = data.exordial;
				$data.patreon_uid = data.patreon_uid;
				$data.patreon_product = data.patreon_product;
				$data.patreon_expiry = data.patreon_expiry;
				$data.box = data.box;
				updateUI(undefined, true);
				updateCommunity();
				break;
		case 'refresh':
			$c.refresh();
			break;
		case 'talk':
			if (!msg.value) return;
			if (!msg.value.substr) return;
			if (!GUEST_PERMISSION.talk) if ($c.guest) {
				$c.send('error', {code: 401});
				return;
			}
			msg.value = msg.value.substr(0, 200);
			if ($c.admin) {
				if (!processAdmin($c.id, msg.value)) break;
			}
			checkTailUser($c.id, $c.place, msg);
			if (msg.whisper) {
				if ($c.guest) {
					$c.send('error', {code: 401});
					return;
				}
				msg.whisper.split(',').forEach(v => {
					if (temp = DIC[DNAME[v]]) {
						temp.send('chat', {
							from: $c.profile.title || $c.profile.name,
							profile: $c.profile,
							value: msg.value
						});
					} else {
						$c.sendError(424, v);
					}
				});
			} else {
				$c.chat(msg.value);
			}
			break;
		case 'friendAdd':
			if (!msg.target) return;
			if ($c.guest) return;
			if ($c.id == msg.target) return;
			if (Object.keys($c.friends).length >= 200) return $c.sendError(452);
			if (temp = DIC[msg.target]) {
				if (temp.guest) return $c.sendError(453);
				if ($c._friend) return $c.sendError(454);
				$c._friend = temp.id;
				temp.send('friendAdd', {from: $c.id});
			} else {
				$c.sendError(450);
			}
			break;
		case 'friendAddRes':
			if (!(temp = DIC[msg.from])) return;
			if (temp._friend != $c.id) return;
			if (msg.res) {
				// $c와 temp가 친구가 되었다.
				$c.addFriend(temp.id);
				temp.addFriend($c.id);
			}
			temp.send('friendAddRes', {target: $c.id, res: msg.res});
			delete temp._friend;
			break;
		case 'friendEdit':
			if (!$c.friends) return;
			if (!$c.friends[msg.id]) return;
			$c.friends[msg.id] = (msg.memo || "").slice(0, 50);
			$c.flush(false, false, true);
			$c.send('friendEdit', {friends: $c.friends});
			break;
		case 'friendRemove':
			if (!$c.friends) return;
			if (!$c.friends[msg.id]) return;
			$c.removeFriend(msg.id);
			break;
		case 'enter':
		case 'setRoom':
			if (!msg.title) stable = false;
			if (!msg.limit) stable = false;
			if (!msg.round) stable = false;
			if (!msg.time) stable = false;
			if (!msg.opts) stable = false;

			msg.code = false;
			msg.limit = Number(msg.limit);
			msg.mode = Number(msg.mode);
			msg.round = Number(msg.round);
			msg.time = Number(msg.time);

			if (isNaN(msg.limit)) stable = false;
			if (isNaN(msg.mode)) stable = false;
			if (isNaN(msg.round)) stable = false;
			if (isNaN(msg.time)) stable = false;

			if (stable) {
				if (msg.title.length > 20) stable = false;
				if (msg.password.length > 20) stable = false;
				if (msg.limit < 2 || msg.limit > 25) {
					msg.code = 432;
					stable = false;
				}
				if (msg.mode < 0 || msg.mode >= MODE_LENGTH) stable = false;
				if (msg.round < 1 || msg.round > 10) {
					msg.code = 433;
					stable = false;
				}
				if (ENABLE_ROUND_TIME.indexOf(msg.time) == -1) stable = false;
			}
			if (msg.type == 'enter') {
				if (msg.id || stable) $c.enter(msg, msg.spectate);
				else $c.sendError(msg.code || 431);
			} else if (msg.type == 'setRoom') {
				if (stable) $c.setRoom(msg);
				else $c.sendError(msg.code || 431);
			}
			break;
		case 'inviteRes':
			if (!(temp = ROOM[msg.from])) return;
			if (!GUEST_PERMISSION.inviteRes) if ($c.guest) return;
			if ($c._invited != msg.from) return;
			if (msg.res) {
				$c.enter({id: $c._invited}, false, true);
			} else {
				if (DIC[temp.master]) DIC[temp.master].send('inviteNo', {target: $c.id});
			}
			delete $c._invited;
			break;
		/* 망할 셧다운제
		case 'caj':
			if(!$c._checkAjae) return;
			clearTimeout($c._checkAjae);
			if(msg.answer == "yes") $c.confirmAjae(msg.input);
			else if(KKuTu.NIGHT){
				$c.sendError(440);
				$c.socket.close();
			}
			break;
		*/
		case 'test':
			checkTailUser($c.id, $c.place, msg);
			break;
		default:
			break;
	}
}

KKuTu.onClientClosed = function($c, code){
	delete DIC[$c.id];
	if($c._error != 409) MainDB.users.update([ '_id', $c.id ]).set([ 'server', "" ]).on();
	if($c.profile) delete DNAME[$c.profile.title || $c.profile.name];
	if($c.socket) $c.socket.removeAllListeners();
	if($c.friends) narrateFriends($c.id, $c.friends, "off");
	KKuTu.publish('disconn', { id: $c.id });

	PLLog.alert("Exit #" + $c.id);
};
