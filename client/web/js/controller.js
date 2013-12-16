/*global define*/
/*jslint eqeq: true*/

// TODO: move to a controller, =)
var that = this;
this.eventhandlers = {
	optionSelect: function(option) {
		// ARGH! Coffeescript!!
		if(option.Type === "Select")
		{
			console.log('SELECT OPTION', option);
			that.eventhandlers.requestSelect(option, function(selectedvalue){
				// send selected option + value to server
			})
		}
	},
	requestSelect: function(option, callback) {
		// request select via modalview
		// on return, callback(option,selectedvalue)
		callback("XXX");
	},
}

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