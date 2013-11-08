/*global require, console*/
require.config({
	baseUrl: "js",
	paths : {
		jquery : "libs/jquery-2.0.3"
	}
});

require(["jquery", "model"], function ($, model) {
  model.getHand(function(hand) {
    console.log(hand);
  });
});