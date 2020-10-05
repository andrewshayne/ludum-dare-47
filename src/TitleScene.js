"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var phaser_1 = require("phaser");
var titleMusic;
var COMPLETED_GAME;
var TitleScene = /** @class */ (function (_super) {
    __extends(TitleScene, _super);
    function TitleScene() {
        return _super.call(this, 'title-scene') || this;
    }
    TitleScene.prototype.init = function (data) {
        COMPLETED_GAME = data.COMPLETED_GAME;
    };
    TitleScene.prototype.preload = function () {
        this.load.audio('menumusic', 'music/menu.wav');
    };
    TitleScene.prototype.create = function () {
        /*
        this.add.image(400, 300, 'sky')
        const particles = this.add.particles('red')
        const emitter = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        })
        const logo = this.physics.add.image(400, 100, 'logo')
        logo.setVelocity(100, 200)
        logo.setBounce(1, 1)
        logo.setCollideWorldBounds(true)
        emitter.startFollow(logo)
        */
        if (COMPLETED_GAME) {
            this.add.text(1280 / 2, 720 * 0.33, 'Thanks for playing!', { fontFamily: 'Georgia', fontSize: '60px', align: 'center' }).setOrigin(0.5);
        }
        this.add.text(1280 / 2, 720 * 0.44, 'Mage Game', { fontFamily: 'Georgia', fontSize: '72px', align: 'center' }).setOrigin(0.5);
        this.add.text(1280 / 2, 720 * 0.55, 'Press space to play.', { fontFamily: 'Georgia', fontSize: '30px', align: 'center' }).setOrigin(0.5);
        titleMusic = this.sound.add('menumusic', { volume: 0.3, loop: true });
        titleMusic.play();
    };
    TitleScene.prototype.update = function () {
        if (phaser_1["default"].Input.Keyboard.JustDown(this.input.keyboard.addKey(phaser_1["default"].Input.Keyboard.KeyCodes.SPACE))) {
            titleMusic.stop();
            this.scene.start('game-scene', { STAGE_LEVEL: 1, playerX: 160, playerY: 540 });
        }
    };
    return TitleScene;
}(phaser_1["default"].Scene));
exports["default"] = TitleScene;
