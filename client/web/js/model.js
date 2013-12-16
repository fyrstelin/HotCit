/*global define, console*/
/*jslint eqeq: true*/

define("model", function () {
	"use strict";

	/**
	 * Parameters:
	 *   - interface server 
	 *		getGame()
	 *		getHand()
	 *		getOptions()
	 *		listen(function callback(update))
	 *	- pid: id of playing player
	 **/
	function Model(server, pid) {
		var data = server.getGame(), //getGame is sync
			game = data.game,
			listeners = [],
			model = this;

		model.opponents = [];
		model.my = {};

		/********************************/
		/**  SIMPLE FIELDS             **/
		/**    - king                  **/
		/**    - player in turn        **/
		/**    - turn                  **/
		/**    - step                  **/
		/**    - round                 **/
		/**    - faceup character      **/
		/********************************/
		function setSimpleFields(update) {
			model.king = update.King || model.king;
			model.playerInTurn = update.PlayerInTurn || model.playerInTurn;
			model.turn = update.Turn || model.turn;
			model.step = update.Step || model.step;
			model.round = update.Round || model.round;
			model.faceUpCharacters = update.FaceUpCharacters || model.faceUpCharacters; //ODO array reference
		}
		setSimpleFields(game);

		/********************************/
		/**    Helper(s)               **/
		/********************************/
		function createUnknownHand(size) {
			var res = [], i;
			for (i = 0; i < size; i += 1) {
				res.push("facedown2");
			}
			return res;
		}

		/********************************/
		/**   OPPONENTS AND ME         **/
		/**     - filter out self      **/
		/**		- fill out self        **/
		/********************************/
		game.Players.forEach(function (player) {
			if (player.Username != pid) {
				model.opponents.push({
					username: player.Username,
					city: player.City,
					hand: createUnknownHand(player.NumberOfCards),
					points: player.Points,
					gold: player.Gold,
					characters: player.Characters
				});
			} else {
				model.my.username = player.Username;
				model.my.city = player.City;
				model.my.points = player.Points;
				model.my.gold = player.Gold;
				model.my.characters = player.Characters;
			}
		});

		model.my.hand = server.getHand(pid);
		model.my.options = server.getOptions(pid);




		/********************************/
		/** LISTENERS                  **/
		/********************************/
		function notify() {
			listeners.forEach(function (cb) {
				cb(model);
			});
		}

		this.addListener = function (cb) {
			listeners.push(cb);
		};

		/********************************/
		/** LONGPOLLING                **/
		/********************************/
		server.listen(function (update) {
			setSimpleFields(update);

			if (update.Players) {
				//traverse players. A map could have been nice
				update.Players.forEach(function (p1) {
					if (p1.Username == model.my.username) { //update my
						model.my.city       = p1.City       || model.my.city;
						model.my.points     = p1.Points	    || model.my.points;
						model.my.gold       = p1.Gold       || model.my.gold;
						model.my.characters = p1.Characters || model.my.characters;
					} else { //update opponents
						model.opponents.forEach(function (p2) {
							if (p1.Username == p2.username) {
								p2.city       = p1.City       || p2.city;
								p2.points     = p1.Points     || p2.points;
								p2.gold       = p1.Gold       || p2.gold;
								p2.characters = p1.Characters || p2.characters;
								if (p1.NumberOfCards) {
									p2.hand = createUnknownHand(p1.NumberOfCards);
								}
							}
						});
					}
				});
			}

			//ODO: implement longpolling on serverside

			//To keep reference to model.my.hand
			model.my.hand.length = 0;
			server.getHand(pid).forEach(function (c) {
				model.my.hand.push(c);
			});

			//To keep reference to model.my.options
			model.my.options.length = 0;
			server.getOptions(pid).forEach(function (o) {
				model.my.options.push(o);
			});

			notify();
		}, data.etag);
	}

	return Model;
});