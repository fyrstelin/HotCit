/*global define*/

define("model", function () {
  "use strict";
  var mock = {
    hand: ["cathedral",
           "dragon_gate",
           "great_wall",
           "watchtower"]
  };

  return {
    getHand: function (done) {
      done(mock.hand);
    }
  }
});