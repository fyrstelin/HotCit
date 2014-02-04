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
			that = this;

		that.opponents = [];
		that.my = {};
        that.players = game.Players.map(function(player) { return player.Username; });
        

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
			that.king = update.King || that.king;
			that.playerInTurn = update.PlayerInTurn || that.playerInTurn;
			that.turn = update.Turn || that.turn;
			that.step = update.Step || that.step;
			that.round = update.Round || that.round;
			that.faceUpCharacters = update.FaceUpCharacters || that.faceUpCharacters;
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
        function setPlayers(update) {
            console.log("setting players");
            console.log(update);
            update.Players.forEach(function (p1) {
                var opp, p2;
                if (p1.Username == pid) {
                    that.my.username   = p1.Username   || that.my.username;
                    that.my.city       = p1.City       || that.my.city;
                    that.my.points     = p1.Points     || that.my.points;
                    that.my.gold       = p1.Gold       || that.my.gold;
                    that.my.characters = p1.Characters || that.my.characters;
                } else { //update opponents
                    opp = that.opponents.filter(function (opp) {
                        return opp.username == p1.Username;
                    });
                    if (opp.length == 1) {
                        p2 = opp[0];
                        p2.city       = p1.City       || p2.city;
                        p2.points     = p1.Points     || p2.points;
                        p2.gold       = p1.Gold       || p2.gold;
                        p2.characters = p1.Characters || p2.characters;
                        if (p1.NumberOfCards) {
                            p2.hand = createUnknownHand(p1.NumberOfCards);
                        }
                    } else if (opp.length == 0) {
                        that.opponents.push({
                            username: p1.Username,
                            city: p1.City,
                            hand: createUnknownHand(p1.NumberOfCards),
                            points: p1.Points,
                            gold: p1.Gold,
                            characters: p1.Characters
                        });
                    } else {
                        console.log("two player named " + p1.Username);
                    }
                }
            });
        }
        setPlayers(game);

		that.my.hand = server.getHand(pid);
		that.my.options = server.getOptions(pid);

        that.my.can = function (what) {
            return that.my.options.some(function (option) {
                return option.Type == what;
            });
        };



		/********************************/
		/** LISTENERS                  **/
		/********************************/
		function notify() {
			listeners.forEach(function (listener) {
				listener.notify(that);
			});
		}

		this.addListener = function (cb) {
            if (listeners.length > 30) {
                throw new Error('more than 30 listeners, careful!', listeners.length);
            }
			listeners.push(cb);
		};

		/********************************/
		/** LONGPOLLING                **/
		/********************************/
		server.listen(function (update) {
			setSimpleFields(update);

			if (update.Players) {
				setPlayers(update);
			}

			//TODO: implement longpolling on serverside
			that.my.hand = server.getHand(pid);
			that.my.options = server.getOptions(pid);

			notify(that);
		}, data.etag);
    }

	return Model;
});