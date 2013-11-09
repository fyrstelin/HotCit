/*global define*/

define("model", function () {
	"use strict";
	var mock = {
		me: {
			Username: "Nygaard",
			City: ["manor", "battlefield", "university", "monastery", "school_of_magic"],
			Hand: ["cathedral", "dragon_gate", "great_wall", "watchtower"],
			Points: 3,
			Gold: 3,
			Characters: ["king"]
		},
		players: [{
			Username: "Turing",
			City: [],
			Hand: ["unknown_district", "unknown_district", "unknown_district", "unknown_district", "unknown_district"],
			Points: 5,
			Gold: 2,
			Characters: ["thief"]
		}, {
			Username: "Ada",
			City: [],
			Hand: ["unknown_district", "unknown_district", "unknown_district", "unknown_district"],
			Points: 3,
			Gold: 1,
			Characters: ["magician"]
		}, {
			Username: "Wiener",
			City: [],
			Hand: ["unknown_district"],
			Points: 5,
			Gold: 6,
			Characters: ["unknown_character"]
		}]
	};

	return {
		getMe: function (done) {
			done(mock.me);
		},

		getOtherPlayers: function (done) {
			done(mock.players);
		}
	};
});