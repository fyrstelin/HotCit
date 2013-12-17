/*global define*/
/*jslint eqeq: true*/

define(function () {
	"use strict";

	/**
	 * Parameters:
	 *   - interface server 
	 *		control(action);
	 *	- pid: id of playing player
	 **/
	function Controller(server, pid) {
		function control(action) {
			server.control(action, pid);
		}

		this.takeGold = function () {
			control({
				Action: "TakeGold"
			});
		};

		this.drawDistricts = function () {
			control({
				Action: "DrawDistricts"
			});
		};

		this.endTurn = function () {
			control({
				Action: "EndTurn"
			});
		};

		this.select = function (choice) {
			if (typeof choice == "string") {
				choice = [choice];
			}
			control({
				Select: choice
			});
		};

		this.buildDistrict = function (district) {
			control({
				Build: district
			});
		};
	}

	return Controller;
});