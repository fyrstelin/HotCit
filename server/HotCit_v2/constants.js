/*jslint node: true*/

module.exports = {
    options: {
        SELECT_CHARACTER: "SelectCharacter",
        SELECT_DISTRICTS: "SelectDistricts",
        TAKE_GOLD: "TakeGold",
        DRAW_DISTRICTS: "DrawDistricts",
        END_TURN: "EndTurn",
        BUILD_DISTRICT: "BuildDistrict"
    },
    messages: {
        CANNOT_SELECT: function (what) {
            "use strict";
            return "Cannot select " + what;
        },
        TURN_ALREADY_ENDED: "You have already ended your turn",
        END_YOUR_TURN: "End your turn"
    }
};