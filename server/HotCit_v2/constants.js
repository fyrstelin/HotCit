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
        END_YOUR_TURN: "End your turn",
        DO_NOT_HAVE_DISTRICT_IN_HAND: function (title) {
            "use strict";
            return "You do not have " + title + " in your hand";
        },
        NOT_ENOUGH_GOLD: function (title) {
            "use strict";
            return title + " is to expensive";
        }
    }
};