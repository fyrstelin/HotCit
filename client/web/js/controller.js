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
        // why control and not use ability or action?
		function control(action) {
			server.control(action, pid);
		}

		this.takeGold = function () {
            console.log('controller> take gold');
			control({
				Action: "TakeGold"
			});
		};

		this.drawDistricts = function () {
            console.log('controller> draw districts');
			control({
				Action: "DrawDistricts"
			});
		};

		this.endTurn = function () {
            console.log('controller> end turn');
			control({
				Action: "EndTurn"
			});
		};

		this.select = function (choice) {
            console.log('controller> select', choice);

			if (typeof choice == "string") {
				choice = [choice];
			}
			control({
				Select: choice
			});
		};

		this.buildDistrict = function (district) {
            console.log('controller> build district');

			control({
				Build: district
			});
		};
        
        this.useAbility = function(source, target) {
            console.log('controller> use ability');

            control({
                ability: { 
                    source: source, 
                    target: target 
                }
            });
        };
	}

	return Controller;
});