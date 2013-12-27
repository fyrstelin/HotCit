/*global define, console */
/*jslint eqeq: true */
/*jslint nomen: true */

define(function () {
	"use strict";

    /* STATIC */
    function getPlayer(pid, model) {
        var i, opponent;
        
        if (model.my.username === pid) {
            return model.my;
        } else {
            for (i = 0; i < model.opponents.length; i += 1) {
                opponent = model.opponents[i];
                if (opponent.username === pid) {
                    return opponent;
                }
            }
        }
    }
    
	/**
	 * Parameters:
	 *   - interface server 
	 *		control(action);
	 *	- pid: id of playing player
	 **/
	function Controller(server, model, pid, state, selectionView) {
        
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
            console.log('controller> end turn', pid);
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
        
        /* METHOD */
        this.useAbility = function (character, option, model, withPromt) {
            console.log('controller> use ability', selectionView, model);
                        
            switch (character) {
            case 'assassin':
                this._assassinHandle();
                break;
            case 'thief':
                this._thiefHandle();
                break;
            case 'magician':
                this._magicianHandle(option);
                break;
            case 'king':
            case 'bishop':
            case 'merchant':
                this._useAbility(character, undefined);
                break;
            case 'architect':
                // RESULT MAY NOT BE SUPPORTED YET
                console.log('architect ability may not be supported yet!');
                this._useAbility(character, undefined);
                break;
            case 'warlord':
                this._warlordHandle(option, withPromt);
                break;
                    
            default:
                throw new Error('switch not supported!', character);
            }
        };
        
        this._magicianHandle = function(option) {
            var that = this;
            
            // swap hand
            if(option.Message.search('your') != -1) {
                this.promt(
                    ['afk', 'rko', 'mis', 'tugend'],
                    function(pid) {
                        that._useAbility('magician', pid);
                    },
                    'please select a player'
                );
            } else {
                // server does not send an update here
                // todo, discuss, I suggest updating server to 
                // either take a list of district cards 
                // or a player
                that._useAbility('magician', undefined);
                
                /*
                this.promt(
                    model.my.hand,
                    function(districts) {
                        that._useAbility('magician', districts);   
                    },
                    'please select a number of districts',
                    true
                );
                */
            }
        };

        this._warlordHandle = function(option, withPromt) {
            if (option.Message.search('Get') != -1) {
                this._useAbility('warlord', undefined);
            } else {
                if (withPromt) {
                    this._selectDistrictWithPromt(model, 'warlord');
                } else {
                    this._selectDistrictWithoutPromt('warlord');
                }
            }    
        };
        
        this._thiefHandle = function() {
            this.promt(
                ['assassin', 'thief', 'magician', 'king', 'biship', 'merchant', 'architect', 'warlord'],
               function(choice) { this._useAbility('thief', choice, undefined); },
               'please select a character');    
        };
        
        this._assassinHandle = function() {
            this.promt(
                ['assassin', 'thief', 'magician', 'king', 'biship', 'merchant', 'architect', 'warlord'],
               function(choice) { this._useAbility('assassin', choice, undefined); },
               'please select a character');       
        };
        
        /* METHOD */
        this.promt = function (choices, callback, title, multiselect) {
            selectionView.promt(choices, callback, title, multiselect);
        };
        
        /* DELEGATE */
        this._useAbility = function (source, target, district) {
            console.log('useAbility', source, target, district);
            control({
                ability: {
                    Source: source,
                    Target: target,
                    District: district
                }
            });
        };
            
        /* DELEGATE */
        this._selectDistrictWithPromt = function (model, character) {
            var that, promtSequence;
            
            that = this;
            promtSequence = {
                choices: ['afk', 'rko', 'mis', 'tugend'], // HARDCODED!!! QUICKFIX -> need access to players somewhere in model???
                title: 'please select a player',
                callback: function (player) {
                    return {
                        choices: getPlayer(player, model).city,
                        title: 'please select a district',
                        callback: function (district) {
                            that._useAbility(character, player, district);
                            return undefined;
                        }
                    };
                }
            };
            selectionView.promtDialog(promtSequence);
        };
        
        /* DELEGATE */
        this._selectDistrictWithoutPromt = function (character) {
            var that = this;
            state.enableDistrictSelect({
                filter: function (card) { return true; },
                callback: function (pid, district) { that._useAbility(character, pid, district); }
            });
        };
    }
    
    return Controller;
});