"use strict";
exports.__esModule = true;
var phaser_1 = require("phaser");
var TitleScene_1 = require("./src/TitleScene"); //'./scenes/TitleScene'
var GameScene_1 = require("./src/GameScene"); //'./scenes/GameScene'
var config = {
    type: phaser_1["default"].AUTO,
    width: 1280,
    height: 720,
    audio: {
        disableWebAudio: true,
        noAudio: false
    },
    physics: {
        "default": 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 1600 }
        }
    },
    scene: [TitleScene_1["default"], GameScene_1["default"]]
};
exports["default"] = new phaser_1["default"].Game(config);
