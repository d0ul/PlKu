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

var Web		 = require("request");
var MainDB	 = require("../db");
var PLLog	 = require("../../sub/jjlog");
var GLOBAL	 = require("../../sub/global.json");
var Const	 = require("../../const");
const axios = require('axios');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

function obtain($user, key, value, term, addValue){
	var now = (new Date()).getTime();
	
	if(term){
		if($user.box[key]){
			if(addValue) $user.box[key].value += value;
			else $user.box[key].expire += term;
		}else $user.box[key] = { value: value, expire: Math.round(now * 0.001 + term) }
	}else{
		$user.box[key] = ($user.box[key] || 0) + value;
	}
}
function consume($user, key, value, force){
	var bd = $user.box[key];
	
	if(bd.value){
		// 기한이 끝날 때까지 box 자체에서 사라지지는 않는다. 기한 만료 여부 확인 시점: 1. 로그인 2. box 조회 3. 게임 결과 반영 직전 4. 해당 항목 사용 직전
		if((bd.value -= value) <= 0){
			if(force || !bd.expire) delete $user.box[key];
		}
	}else{
		if(($user.box[key] -= value) <= 0) delete $user.box[key];
	}
}

exports.run = function(Server, page){

Server.get("/box", function(req, res){
	if(req.session.profile){
		/*if(Const.ADMIN.indexOf(req.session.profile.id) == -1){
			return res.send({ error: 555 });
		}*/
	}else{
		return res.send({ error: 400 });
	}
	MainDB.users.findOne([ '_id', req.session.profile.id ]).limit([ 'box', true ]).on(function($body){
		if(!$body){
			res.send({ error: 400 });
		}else{
			res.send($body.box);
		}
	});
});
Server.get("/help", function(req, res){
	page(req, res, "help", {
		'KO_INJEONG': Const.KO_INJEONG
	});
});

Server.get("/welcomebox", function(req, res){
	if(!req.session.profile) res.send({ error: 400 });
	var uid = req.session.profile.id;
	var cid = "WELCOME20240511";

		MainDB.kkutu_coupon_log.findOne([ 'uid', uid ], [ 'cid', cid ]).on(function($log){
			if($log) {
				if (!res.headersSent) {
					res.send({ error: 406 });
				}
			}
		});
		MainDB.users.findOne([ '_id', uid ]).on(function($user){
			if (!res.headersSent) {
				var kkutuBox = $user.box;
				if(!kkutuBox) kkutuBox = {};
				if(kkutuBox["welcomemay"]) kkutuBox["welcomemay"] += 5;
				else kkutuBox["welcomemay"] = 5;

				MainDB.kkutu_coupon_log.insert([ 'uid', uid ], [ 'cid', cid ], [ 'obtained', new Date(Date.now()) ]).on();
				MainDB.users.update([ '_id', uid ]).set([ 'box', kkutuBox ]).on();
				res.send({ result: 200, value: "welcomebox" });
			}
		});
});

Server.get("/welcomebox/check", function(req, res){
	if(!req.session.profile) res.send({ error: 406 });
	var uid = req.session.profile.id;
	var cid = "WELCOME20240511";

	MainDB.kkutu_coupon_log.findOne([ 'uid', uid ], [ 'cid', cid ]).on(function($log){
		if($log) {
			if (!res.headersSent) {
				res.send({ error: 406 });
			}
		}
	});
		if (!res.headersSent) {
		res.send({ result: 200 });
		}
});

Server.get("/coupon/:id", function(req, res){
	if(!req.session.profile) res.send({ error: 400 });
	if (!res.headersSent) {
	var uid = req.session.profile.id;
	var cid = req.params.id;

	MainDB.kkutu_coupon.findOne([ '_id', cid ]).on(function($coupon){
		if(!$coupon){res.send({ error: 404 });return;}
		if($coupon.expire < Date.now()) {
			if (!res.headersSent) {
				res.send({ error: 405 });
			}
			return;
		}
		MainDB.kkutu_coupon_log.findOne([ 'uid', uid ], [ 'cid', cid ]).on(function($log){
			if($log) {
				if (!res.headersSent) {
					res.send({ error: 406 });
				}
			}
		});
		MainDB.users.findOne([ '_id', uid ]).on(function($user){
			
			if (!res.headersSent) {
				var updatedMoney = Number($user.money) + Number($coupon.value);
		
			MainDB.kkutu_coupon.update([ '_id', cid ]).set([ 'hit', $coupon.hit + 1 ]).on();
			MainDB.kkutu_coupon_log.insert([ 'uid', uid ], [ 'cid', cid ], [ 'obtained', new Date(Date.now()) ]).on();
			MainDB.users.update([ '_id', uid ]).set([ 'money', updatedMoney ]).on();
				res.send({ result: 200, value: $coupon.value, type: $coupon.type });
			}
		});
	});}
});

Server.get("/securityCode", function(req, res){
	if(!req.session.profile) res.send({ error: 400 });
	if (!res.headersSent) {
	var uid = req.session.profile.id;

	MainDB.users.findOne([ '_id', uid ]).on(function($user){
		if(!$user.eventuid || $user.eventuid == "unset"){
			//8 character a-z, A-Z, 0-9
			var code = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			for (var i = 0; i < 8; i++) code += possible.charAt(Math.floor(Math.random() * possible.length));
			MainDB.users.update([ '_id', uid ]).set([ 'eventuid', code ]).on();
			res.send({ result: 200, value: code });
		}

		else res.send({ result: 200, value: $user.eventuid });
	});}
});


Server.get("/sns/cafe/post/:cafeid/:listCnt/:boardid", async function(req, res){
	if (!req.headers.referer || !req.headers.referer.includes('plku.pcor.me')) {
		return res.status(403).send('Forbidden');
	}

    const cafeId = req.params.cafeid;
	var boardId = req.params.boardid;
	const listCnt = req.params.listCnt;

	if (boardId == "0") {
		boardId = "";
	}

	try {
		const response = await axios.get(`https://apis.naver.com/cafe-web/cafe2/ArticleListV2dot1.json?search.clubid=${cafeId}&search.queryType=lastArticle&search.page=1&search.perPage=${listCnt}&search.menuid=${boardId}`);
		res.send(response.data);
	} catch (error) {
		res.status(403).send('Forbidden');
	}
});

Server.get("/sns/cafe/notice/:cafeid", async function(req, res){
	if (!req.headers.referer || !req.headers.referer.includes('plku.pcor.me')) {
		return res.status(403).send('Forbidden');
	}

    const cafeId = req.params.cafeid;

	try {
		const response = await axios.get(`https://apis.naver.com/cafe-web/cafe2/NoticeListV3.json?cafeId=${cafeId}&ad=false&mobileWeb=true&adUnit=MW_CAFE_BOARD&uuid=`);
		res.send(response.data);
	} catch (error) {
		res.status(403).send('Forbidden');
	}
});


Server.get("/sns/cafe/view/:cafeid/:postid", async function(req, res){
	if (!req.headers.referer || !req.headers.referer.includes('plku.pcor.me')) {
		return res.status(403).send('Forbidden');
	}

    const cafeId = req.params.cafeid;
	const postId = req.params.postid;

	try {
		const response = await axios.get(`https://apis.naver.com/cafe-web/cafe-articleapi/v2.1/cafes/${cafeId}/articles/${postId}`);
		res.send(response.data);
	} catch (error) {
		res.status(403).send('Forbidden');
	}
});

Server.get("/audioProxy", async function(req, res){
    if (!req.headers.referer || !req.headers.referer.includes('plku.pcor.me')) {
        return res.status(403).send('Forbidden');
    }

    const encodedURL = req.query.link;
    var decodedURL = decodeURIComponent(encodedURL);
    const defaultURL = "https://plku.pcor.me/media/kkutu/LobbyBGM.mp3";

    if (!decodedURL.match(/\.mp3$|\.ogg$|\.wav$/)) {
        if (ytdl.validateURL(decodedURL)) {
            // If it's a YouTube URL, stream the audio
            const stream = ytdl(decodedURL, { filter: 'audioonly' });
            const ffmpegStream = ffmpeg(stream)
                .audioBitrate(128)
                .format('mp3')
                .on('end', () => console.log('YT Video Request on AudioProxy ('+decodedURL+')'))
                .on('error', (error) => console.error(error));
            res.setHeader('Content-Type', 'audio/mpeg');
            ffmpegStream.pipe(res);
        } else {
            decodedURL = defaultURL;
            const response = await axios.get(decodedURL, { responseType: 'arraybuffer' });
            res.send(response.data);
        }
    } else {
        try {
            const response = await axios.get(decodedURL, { responseType: 'arraybuffer' });
            res.send(response.data);
        } catch (error) {
            decodedURL = defaultURL;
            const response = await axios.get(decodedURL, { responseType: 'arraybuffer' });
            res.send(response.data);
        }
    }
});

Server.get("/ranking", function(req, res){
	if (!req.headers.referer || !req.headers.referer.includes('plku.pcor.me')) {
		return res.status(403).send('Forbidden');
	}
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.redis.getSurround(id, 15).then(function($body){
			var idx = 0;
			$body.data.forEach(function($item){
				MainDB.users.findOne([ '_id', $item.id ]).limit([ 'nickname', true ]).on(function($user){
					$body.data[idx].nickname = $user.nickname;
					if( $body.data[idx].id !== id ) $body.data[idx].id = null;
					idx++;
					if(idx == $body.data.length) res.send($body);
				});
			});
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.redis.getPage(pg, 15).then(function($body){
			var idx = 0;
			$body.data.forEach(function($item){
				MainDB.users.findOne([ '_id', $item.id ]).limit([ 'nickname', true ]).on(function($user){
					$body.data[idx].nickname = $user.nickname;
					idx++;
					if(idx == $body.data.length) res.send($body);
				});
			});
		});
	}
});

Server.get("/injeong/:word", function(req, res){
	if(!req.session.profile) return res.send({ error: 402 });
	var word = req.params.word;
	var theme = req.query.theme;
	var now = Date.now();
	
	if(now - req.session.injBefore < 2000) return res.send({ error: 429 });
	req.session.injBefore = now;
	
	MainDB.kkutu['ko'].findOne([ '_id', word.replace(/[^가-힣0-9]/g, "") ]).on(function($word){
		if($word) return res.send({ error: 409 });
		MainDB.kkutu_injeong.findOne([ '_id', word ]).on(function($ij){
			if($ij){
				if($ij.theme == '~') return res.send({ error: 406 });
				else return res.send({ error: 403 });
			}
				MainDB.kkutu_injeong.insert([ '_id', word ], [ 'theme', theme ], [ 'createdAt', now ], [ 'writer', req.session.profile.id ]).on(function($res){
					res.send({ message: "OK" });
				});
		});
	});
});

Server.get("/cf/:word", function(req, res){
	res.send(getCFRewards(req.params.word, Number(req.query.l || 0), req.query.b == "1"));
});


Server.get("/shop", function(req, res){
	MainDB.kkutu_shop.find().limit([ 'cost', true ], [ 'term', true ], [ 'group', true ], [ 'options', true ], [ 'updatedAt', true ]).on(function($goods){
		res.json({ goods: $goods });
	});
	// res.json({ error: 555 });
});

// POST
Server.post("/profile", function(req, res){
	var nickname = req.body.nickname;
	var exordial = req.body.exordial;
	
	if(req.session.profile){
		if(exordial || exordial === ""){
			if(exordial.length > 100) exordial = exordial.slice(0, 100);
			MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'exordial', exordial ]).on();
		}

		if(nickname){
			if(nickname.length > 12) nickname = nickname.slice(0, 12);
			MainDB.users.findOne([ 'nickname', nickname ]).on(function(data){
				
				if(data) return res.send({ error: 456 });
				var currentDate = new Date().getTime();

				MainDB.users.findOne([ '_id', req.session.profile.id ]).on(function(requester){
					var changedDate = requester.nickchanged;
					var unavailable = currentDate < (changedDate + (7 * 24 * 60 * 60 * 1000));
					
					if(unavailable) return res.send({ error: 457 });
					
				var regex = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣ぁ-んァ-ヶ一-龯々〆〤〥〩ぁ-ゞァ-ヾ\s!#$%&()*+,-./:;=?@[\\\]^_`{|}~]*$/;
				var BAD = new RegExp([
					"느으*[^가-힣]*금마?", "니[^가-힣]*(엄|앰|엠)", "(ㅄ|ㅅㅂ|ㅂㅅ)", "미친[^가-힣](년|놈|개)?", "(병|븅|빙|등)[^가-힣]*(신|딱)", "보[^가-힣]*지", "(새|섀|쌔|썌)[^가-힣]*(기|끼)", "섹[^가-힣]*스", "(시|씨|쉬|쒸)이*입?[^가-힣]*(발|빨|벌|뻘|팔|펄)", "십[^가-힣]*새", "(애|에)[^가-힣]*미", "자[^가-힣]*지", "(졸|존)[^가-힣]*(나|라|만)","좃|좆|죶", "지랄", "창[^가-힣]*(녀|년|놈)", "개[^가-힣]*(년|녀|쓰레기|스레기|돼지|되지|초딩)", "나가[^가-힝]*(뒤져|디져|죽어)","(닥|닭)[^가-힣]*(쳐|처)", "(또|똘)[^가-힣]*(아이|라이)","빡(통대가리|대가리)", "썩을", "(fuck|뻑큐|뻐큐)", "(부|불)[^가-힣]*(알|랄)","씹", "십[^가-힣]*(년|놈)" , "아가리[^가-힣]*?","(엠|엄)[^가-힣]*창","(짱|장)[^가-힣]*(깨|꼴라|궤)","(찐|왕)[^가-힣]*(따|다)", "틀딱", "페[^가-힣]*미", "한남",  "(염|옘)[^가-힣]*병", "sex",
					"엄[^가-힣]*마", "아[^가-힣]*빠", "어[^가-힣]*머[^가-힣]*니", "아[^가-힣]*버[^가-힣]*지", "어[^가-힣]*머[^가-힣]*님", "한선", "규빈", "시현", "도훈", "대운", "쪼리핑", "염한선", "밥먹나", "승[^가-힣]*만", "정희", "두[^가-힣]*환", "태우", "영삼", "무[^가-힣]*현", "명박", "근혜", "재인", "석열", "진핑", "국민의힘", "국힘", "민주당", "개혁신당", "조국혁신", "GM", "관리자", "운영자", "서버장", "천안문", "난징", "센징", "끄투코리아", "끄투리오"
				  ].join('|'), "g");

				if (!regex.test(nickname)) return res.send({ error: 458 });
				if (BAD.test(nickname)) return res.send({ error: 459 });
				MainDB.users.update([ '_id', req.session.profile.id ]).set({ 'nickname': nickname, 'nickchanged': currentDate }).on();

				return res.send({ result: 200 });
				});

			});
		}

		if(!nickname) return res.send({ result: 200 });
	}else return res.send({ error: 400 });
});
Server.post("/buy/:id", function(req, res){
	if(req.session.profile){
		var uid = req.session.profile.id;
		var gid = req.params.id;
		
		MainDB.kkutu_shop.findOne([ '_id', gid ]).on(function($item){
			if(!$item) return res.json({ error: 400 });
			if($item.cost < 0) return res.json({ error: 400 });
			MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
				if(!$user) return res.json({ error: 400 });
				if(!$user.box) $user.box = {};
				var postM = $user.money - $item.cost;
				
				if(postM < 0) return res.send({ result: 400 });
				
				obtain($user, gid, 1, $item.term);
				MainDB.users.update([ '_id', uid ]).set(
					[ 'money', postM ],
					[ 'box', $user.box ]
				).on(function($fin){
					res.send({ result: 200, money: postM, box: $user.box });
					PLLog.log("[PURCHASED] " + gid + " by " + uid);
				});
				// HIT를 올리는 데에 동시성 문제가 발생한다. 조심하자.
				MainDB.kkutu_shop.update([ '_id', gid ]).set([ 'hit', $item.hit + 1 ]).on();
			});
		});
	}else res.json({ error: 423 });
});
Server.post("/equip/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isLeft = req.body.isLeft == "true";
	var now = Date.now() * 0.001;
	
	MainDB.users.findOne([ '_id', uid ]).limit([ 'box', true ], [ 'equip', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		if(!$user.equip) $user.equip = {};
		var q = $user.box[gid], r;
		
		MainDB.kkutu_shop.findOne([ '_id', gid ]).limit([ 'group', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			if(!Const.AVAIL_EQUIP.includes($item.group)) return res.json({ error: 400 });
			
			var part = $item.group;
			if(part.substr(0, 3) == "BDG") part = "BDG";
			if(part == "Mhand") part = isLeft ? "Mlhand" : "Mrhand";
			var qid = $user.equip[part];
			
			if(qid){
				r = $user.box[qid];
				if(r && r.expire){
					obtain($user, qid, 1, r.expire, true);
				}else{
					obtain($user, qid, 1, now + $item.term, true);
				}
			}
			if(qid == $item._id){
				delete $user.equip[part];
			}else{
				if(!q) return res.json({ error: 430 });
				consume($user, gid, 1);
				$user.equip[part] = $item._id;
			}
			MainDB.users.update([ '_id', uid ]).set([ 'box', $user.box ], [ 'equip', $user.equip ]).on(function($res){
				res.send({ result: 200, box: $user.box, equip: $user.equip });
			});
		});
	});
});
Server.post("/payback/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isDyn = gid.charAt() == '$';
	
	MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		var q = $user.box[gid];
		
		if(!q) return res.json({ error: 430 });
		MainDB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			
			consume($user, gid, 1, true);
			$user.money = Number($user.money) + Math.round(0.2 * Number($item.cost));
			MainDB.users.update([ '_id', uid ]).set([ 'money', $user.money ], [ 'box', $user.box ]).on(function($res){
				res.send({ result: 200, box: $user.box, money: $user.money });
			});
		});
	});
});
function blendWord(word){
	var lang = parseLanguage(word);
	var i, kl = [];
	var kr = [];
	
	if(lang == "en") return String.fromCharCode(97 + Math.floor(Math.random() * 26));
	if(lang == "ko"){
		for(i=word.length-1; i>=0; i--){
			var k = word.charCodeAt(i) - 0xAC00;
			
			kl.push([ Math.floor(k/28/21), Math.floor(k/28)%21, k%28 ]);
		}
		[0,1,2].sort((a, b) => (Math.random() < 0.5)).forEach((v, i) => {
			kr.push(kl[v][i]);
		});
		return String.fromCharCode(((kr[0] * 21) + kr[1]) * 28 + kr[2] + 0xAC00);
	}
}
function parseLanguage(word){
	return word.match(/[a-zA-Z]/) ? "en" : "ko";
}
Server.post("/cf", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var tray = (req.body.tray || "").split('|');
	var i, o;
	
	if(tray.length < 1 || tray.length > 6) return res.json({ error: 400 });
	MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		var req = {}, word = "", level = 0;
		var cfr, gain = [];
		var blend;
		
		for(i in tray){
			word += tray[i].slice(4);
			level += 68 - tray[i].charCodeAt(3);
			req[tray[i]] = (req[tray[i]] || 0) + 1;
			if(($user.box[tray[i]] || 0) < req[tray[i]]) return res.json({ error: 434 });
		}
		MainDB.kkutu[parseLanguage(word)].findOne([ '_id', word ]).on(function($dic){
			if(!$dic){
				if(word.length == 3){
					blend = true;
				}else return res.json({ error: 404 });
			}
			cfr = getCFRewards(word, level, blend);
			if($user.money < cfr.cost) return res.json({ error: 407 });
			for(i in req) consume($user, i, req[i]);
			for(i in cfr.data){
				o = cfr.data[i];
				
				if(Math.random() >= o.rate) continue;
				if(o.key.charAt(4) == "?"){
					o.key = o.key.slice(0, 4) + (blend ? blendWord(word) : word.charAt(Math.floor(Math.random() * word.length)));
				}
				obtain($user, o.key, o.value, o.term);
				gain.push(o);
			}
			$user.money -= cfr.cost;
			MainDB.users.update([ '_id', uid ]).set([ 'money', $user.money ], [ 'box', $user.box ]).on(function($res){
				res.send({ result: 200, box: $user.box, money: $user.money, gain: gain });
			});
		});
	});
	// res.send(getCFRewards(req.params.word, Number(req.query.l || 0)));
});
Server.get("/dict/:word", function(req, res){
    var word = req.params.word;
    var lang = req.query.lang;
    var DB = MainDB.kkutu[lang];
    
    if(!DB) return res.send({ error: 400 });
    if(!DB.findOne) return res.send({ error: 400 });
    DB.findOne([ '_id', word ]).on(function($word){
        if(!$word) return res.send({ error: 404 });
        res.send({
            word: $word._id,
            mean: $word.mean,
            theme: $word.theme,
            type: $word.type
        });
    });
});

};
function getCFRewards(word, level, blend){
	var R = [];
	var f = {
		len: word.length, // 최대 6
		lev: level // 최대 18
	};
	var cost = 20 * f.lev;
	var wur = f.len / 36; // 최대 2.867
	
	if(blend){
		if(wur >= 0.5){
			R.push({ key: "$WPA?", value: 1, rate: 1 });
		}else if(wur >= 0.35){
			R.push({ key: "$WPB?", value: 1, rate: 1 });
		}else if(wur >= 0.05){
			R.push({ key: "$WPC?", value: 1, rate: 1 });
		}
		cost = Math.round(cost * 0.2);
	}else{
		R.push({ key: "dictPage", value: Math.round(f.len * 0.6), rate: 1 });
		R.push({ key: "boxB4", value: 1, rate: Math.min(1, f.lev / 7) });
		if(f.lev >= 5){
			R.push({ key: "boxB3", value: 1, rate: Math.min(1, f.lev / 15) });
			cost += 10 * f.lev;
			wur += f.lev / 20;
		}
		if(f.lev >= 10){
			R.push({ key: "boxB2", value: 1, rate: Math.min(1, f.lev / 30) });
			cost += 20 * f.lev;
			wur += f.lev / 10;
		}
		if(wur >= 0.05){
			if(wur > 1) R.push({ key: "$WPC?", value: Math.floor(wur), rate: 1 });
			R.push({ key: "$WPC?", value: 1, rate: wur % 1 });
		}
		if(wur >= 0.35){
			if(wur > 2) R.push({ key: "$WPB?", value: Math.floor(wur / 2), rate: 1 });
			R.push({ key: "$WPB?", value: 1, rate: (wur / 2) % 1 });
		}
		if(wur >= 0.5){
			R.push({ key: "$WPA?", value: 1, rate: wur / 3 });
		}
	}
	return { data: R, cost: cost };
}