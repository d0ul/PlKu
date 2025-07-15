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

const MainDB	 = require("../db");
const PLLog	 = require("../../sub/jjlog");
// const Ajae	 = require("../../sub/ajaejs").checkAjae;
const passport = require('passport');
const glob = require('glob-promise');
const GLOBAL	 = require("../../sub/global.json");
const config = require('../../sub/auth.json');
const path = require('path')

function process(req, accessToken, MainDB, $p, done) {
    $p.token = accessToken;
    $p.sid = req.session.id;
    let now = Date.now();
    $p.sid = req.session.id;
    req.session.admin = GLOBAL.ADMIN.includes($p.id);
    req.session.authType = $p.authType;
    MainDB.session.upsert([ '_id', req.session.id ]).set({
        'profile': $p,
        'createdAt': now
    }).on();
    MainDB.users.findOne([ '_id', $p.id ]).on(($body) => {
        req.session.profile = $p;
		if($body){
			if($body.nickname && $body.nickname != null) $p.title = $p.name = $body.nickname;
		};
        MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();
		MainDB.session.upsert([ '_id', req.session.id ]).set({
			'profile': $p,
			'createdAt': now
		}).on();
    });
    done(null, $p);
}


exports.run = (Server, page) => {
    //passport configure
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    const strategyList = {};
    
	for (let i in config) {
		try {
			let auth = require(path.resolve(__dirname, '..', 'auth', 'auth_' + i + '.js'))
			Server.get('/login/' + auth.config.vendor, passport.authenticate(auth.config.vendor))
			Server.get('/login/' + auth.config.vendor + '/callback', passport.authenticate(auth.config.vendor, {
				successRedirect: '/o/game?server=0',
				failureRedirect: '/loginfail'
			}))
			passport.use(new auth.config.strategy(auth.strategyConfig, auth.strategy(process, MainDB /*, Ajae */)));
			strategyList[auth.config.vendor] = {
				vendor: auth.config.vendor,
				displayName: auth.config.displayName,
				color: auth.config.color,
				fontColor: auth.config.fontColor
			};

			PLLog.info(`OAuth Strategy ${i} loaded successfully.`)
		} catch (error) {
			PLLog.error(`OAuth Strategy ${i} is not loaded`)
			PLLog.error(error.message)
		}
	}
	
	Server.get("/login/old", (req, res) => {
		page(req, res, "login", { '_id': req.session.id, 'text': req.query.desc, 'loginList': strategyList });
	});
	
	Server.get("/login", (req, res) => {
		if (global.isPublic) {
			//
			res.sendFile(path.resolve(__dirname, '..',  'public', 'login.html'))
		} else {
			let now = Date.now();
			let id = req.query.id || "ADMIN";
	
			if (!req.session.profile) {
				res.redirect("/o/game?server=0&f=1");
			} else {
				let lp = {
					id: id,
					title: "LOCAL #" + id,
					birth: [4, 16, 0],
					_age: { min: 20, max: undefined }
				};
	
				MainDB.session.upsert(['_id', req.session.id]).set(['profile', JSON.stringify(lp)], ['createdAt', now]).on(function ($res) {
					MainDB.users.update(['_id', id]).set(['lastLogin', now]).on();
					req.session.admin = true;
					req.session.profile = lp;
					res.redirect("/o/game?server=0");
				});
			}
		}
	});
	

	Server.get("/logout", (req, res) => {
		if(!req.session.profile){
			return res.redirect("/");
		} else {
			req.session.destroy();
			res.redirect('/');
		}
	});

	Server.get("/loginfail", (req, res) => {
		page(req, res, "loginfail");
	});
}
