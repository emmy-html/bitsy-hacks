/**
🔈
@file basic sfx
@summary "walk" and "talk" sound effect support
@license MIT
@version auto
@author Sean S. LeBlanc

@description
Adds a basic sound effect API and hooks up "walk" and "talk" sound effects

The walk sound effect plays every time the player moves.
The talk sound effect plays every time the dialog box changes "pages" (e.g. when it opens, when the player presses a key to continue).

Includes an optional feature which makes sound effect volume reduce if it was played recently.

HOW TO USE:
1. Place your "walk" and "talk" sound files somewhere relative to your bitsy html file
2. Copy-paste `<audio id="walk" src="<relative path to your walk sound file>" preload="auto" volume="1.0"></audio>` into the <body> of your document
3. Copy-paste `<audio id="talk" src="<relative path to your talk sound file>" preload="auto" volume="1.0"></audio>` into the <body> of your document
4. Copy-paste this script into a script tag after the bitsy source

Additional sounds can be added by by including more <audio> tags with different ids and calling `sounds.<sound id>()` as needed.
If you'd like to trigger sounds from dialog, check out the bitsymuse hack!
*/
import bitsy from 'bitsy';
import {
	before,
	after,
} from './helpers/kitsy-script-toolkit';
import { clamp } from './helpers/utils';

export var hackOptions = {
	beNiceToEars: true, // if `true`, reduces volume of recently played sound effects
};

var sounds = {};
before('startExportedGame', function () {
	function playSound(sound) {
		if (hackOptions.beNiceToEars) {
			// reduce volume if played recently
			sound.volume = clamp((bitsy.prevTime - sound.lastPlayed) * 0.002 ** 0.5, 0.25, 1.0);
			sound.lastPlayed = bitsy.prevTime;
		}

		// play sound
		if (sound.paused) {
			sound.play();
		} else {
			sound.currentTime = 0;
		}
	}

	// get sound elements
	Array.from(document.getElementsByTagName('audio')).forEach(function (i) {
		i.lastPlayed = -Infinity;
		i.volume = 1;
		sounds[i.id] = playSound.bind(undefined, i);
	});
});

// walk hook
var px;
var py;
var r;
before('movePlayer', function () {
	var p = bitsy.player();
	px = p.x;
	py = p.y;
	r = p.room;
});
after('movePlayer', function () {
	var p = bitsy.player();
	if (sounds.walk && (p.x !== px || p.y !== py || p.room !== r)) sounds.walk();
});
// talk hooks
after('startTitle', function () {
	if (bitsy.dialogBuffer.IsActive() && sounds.talk) sounds.talk();
});
after('cueScript', function () {
	requestAnimationFrame(function () {
		if (bitsy.dialogBuffer.IsActive() && sounds.talk) sounds.talk();
	});
});
after('dialogBuffer.Continue', function () {
	if (bitsy.dialogBuffer.IsActive() && sounds.talk) sounds.talk();
});
