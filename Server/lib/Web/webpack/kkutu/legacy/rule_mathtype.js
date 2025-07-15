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

$lib.MathType.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	$data._chatter = mobile ? $stage.game.hereText : $stage.talk;
	clearBoard();
	$data._round = data.round;
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 10000;
	$data._list = data.list.concat(data.list);
	$data.chain = 0;
	drawListMQ();
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
function onSpace(e){
	if(e.keyCode == 32){
		$stage.chatBtn.trigger('click');
		e.preventDefault();
	}
}
function drawListMQ(){
	var wl = $data._list.slice($data.chain);

	wl = wl.map(function(v){
		return v.replace(/\*/g, " × ").replace(/\//g, " ÷ ").replace(/\+/g, " + ").replace(/-/g, " - ");
	} );
	
	var lv = 5;
	var pts = "";
	var w0l = wl[0].length;
	
	if(w0l >= 20) pts = "18px";
	if(w0l >= 50) pts = "15px";
	$stage.game.display.css('font-size', pts);
	wl[0] = "<label style='color: #FFFF44; font-weight: 700;'>" + wl[0] + " = ?</label> | ";
	$stage.game.display.html(wl.slice(0, lv).join(' '));
	$stage.game.chain.show().html($data.chain);
	$(".jjo-turn-time .graph-bar")
		.width("100%")
		.html(wl.slice(lv, 2 * lv).join(' '))
		.css({ 'text-align': "center", 'background-color': "#70712D" });
}
$lib.MathType.spaceOn = function(){
	$data._spaced = true;
	$("body").on('keydown', "#" + $data._chatter.attr('id'), onSpace);
};
$lib.MathType.spaceOff = function(){
	delete $data._spaced;
	$("body").off('keydown', "#" + $data._chatter.attr('id'), onSpace);
};
$lib.MathType.turnStart = function(data){
	if(!$data._spectate){
		$stage.game.here.show();
		if(mobile) $stage.game.hereText.val("").focus();
		else $stage.talk.val("").focus();
		$lib.MathType.spaceOn();
	}
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._tTime = addInterval(turnGoing, TICK);
	$data._roundTime = data.roundTime;
	playBGM('ps');
	recordEvent('turnStart', {
		data: data
	});
};
$lib.MathType.turnGoing = $lib.Jaqwi.turnGoing;
$lib.MathType.turnEnd = function(id, data){
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html("+" + data.score);
	var $uc = $("#game-user-" + id);
	
	if(data.error){
		$data.chain++;
		drawListMQ();
		playSound('fail');
	}else if(data.ok){
		if($data.id == id){
			$data.chain++;
			drawListMQ();
			playSound('mission');
			pushHistory(data.value, "");
		}else if($data._spectate){
			playSound('mission');
		}
		addScore(id, data.score);
		drawObtainedScore($uc, $sc);
		updateScore(id, getScore(id));
	}else{
		clearInterval($data._tTime);
		$lib.MathType.spaceOff();
		$stage.game.here.hide();
		stopBGM();
		playSound('horr');
		if($data._round < $data.room.round) restGoing(10);
	}
};
function restGoing(rest){
	$(".jjo-turn-time .graph-bar")
		.html(rest + L['afterRun']);
	if(rest > 0) addTimeout(restGoing, 1000, rest - 1);
}
function drawSpeed(table){
	var i;
	
	for(i in table){
		$("#game-user-" + i + " .game-user-score").empty()
			.append($("<div>").css({ 'float': "none", 'color': "#4444FF", 'text-align': "center" }).html(table[i] + "<label style='font-size: 11px;'>" + L['kpm'] + "</label>"));
	}
}
