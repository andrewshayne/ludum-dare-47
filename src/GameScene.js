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
var action;
(function (action) {
    action[action["JUMP"] = 1] = "JUMP";
    action[action["FIRE"] = 2] = "FIRE";
})(action || (action = {}));
var LEVEL_COUNT = 2;
var STAGE_LEVEL;
var playerX;
var playerY;
var bg;
//player
var player;
var isKnockback = false;
var knockbackTimer;
//loop actions
var loopIndex;
var loopActions;
var loopActionReady;
var loopImages;
//ui elements
var ringCenter = new phaser_1["default"].Math.Vector2(1150, 130);
var ringImageRadius = 60;
var actionRing;
var ringSelect;
//map
var map;
//layers
var layer1b;
var layer1;
var layer2;
var layer3;
var crates;
//player projectiles
var projectiles;
//crate group
var cratesGroup;
//keyboard variables
var key_space;
var key_e;
//audio
var music;
var fire_sound;
var jump_sound;
var cratebreak_sound;
var footsteps_sound;
var GameScene = /** @class */ (function (_super) {
    __extends(GameScene, _super);
    function GameScene(STAGE_LEVEL) {
        return _super.call(this, 'game-scene') || this;
    }
    GameScene.prototype.init = function (data) {
        STAGE_LEVEL = data.STAGE_LEVEL;
        playerX = data.playerX;
        playerY = data.playerY;
    };
    GameScene.prototype.preload = function () {
        console.log('level: ', STAGE_LEVEL);
        this.load.tilemapTiledJSON('map1', 'magetiles1.json');
        this.load.tilemapTiledJSON('map2', 'magetiles2.json');
        //this.load.tilemapTiledJSON('map3', 'magetiles3.json')
        this.load.image('bg', 'cave_bg_fit.png');
        //this.load.image('magetiles', 'magetiles.png')
        this.load.image('magetiles-extruded', 'magetiles-extruded.png');
        this.load.spritesheet('mage_animation', 'mageanimations.png', { frameWidth: 173, frameHeight: 186 });
        this.load.spritesheet('fireball_animation', 'fireballanimationfull.png', { frameWidth: 160, frameHeight: 308 });
        this.load.spritesheet('crate', 'cratepoof.png', { frameWidth: 160, frameHeight: 160 });
        //this.load.image('crate', 'crate.png')
        //UI elements
        this.load.image('ring', 'ring.png');
        this.load.image('ring_select', 'ringselect.png');
        this.load.image('jump_icon', 'jumparrowsolid.png');
        this.load.spritesheet('fire_icon_animation', 'firecharge.png', { frameWidth: 51, frameHeight: 90 });
        //audio
        this.load.audio('music', 'music/library.wav');
        this.load.audio('fire_sfx', 'sfx/fireballs/Fireball1.wav');
        this.load.audio('jump_sfx', 'sfx/landing/Landing.wav');
        this.load.audio('cratebreak_sfx', 'sfx/crate/cratebreak.wav');
        this.load.audio('footsteps_sfx', 'sfx/footsteps/footsteps.wav');
    };
    GameScene.prototype.create = function () {
        //set large bg
        //bg = this.add.image(890, 610, 'bg')
        //set 1280x720 bg
        bg = this.add.image(640, 360, 'bg');
        //make bg static
        bg.setScrollFactor(0, 0);
        map = this.make.tilemap({ key: 'map' + STAGE_LEVEL });
        //EXTRUDED
        var tileset = map.addTilesetImage('magetiles', 'magetiles-extruded', 80, 80, 1, 2); //grab the tiled tileset file "tileset" from "tiles" image file
        //NON-EXTRUDED
        //const tileset = map.addTilesetImage('magetiles', 'magetiles') //grab the tiled tileset file "tileset" from "tiles" image file
        layer1 = map.createStaticLayer('CollideLayer', tileset, 0, 0);
        layer2 = map.createStaticLayer('BehindLayer', tileset, 0, 0);
        crates = map.createFromObjects('Crates', 'crate', { key: 'crate' });
        //this.physics.world.enable(crates)
        cratesGroup = this.add.group(crates);
        this.physics.world.enable(cratesGroup);
        ///player
        player = this.physics.add.sprite(playerX, playerY, 'mage_animation');
        player.body.setSize(50, 160);
        player.body.setOffset(80, 20);
        player.setMaxVelocity(800, 600);
        //set camera and follow player
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels); //bg.displayWidth, bg.displayHeight)
        this.cameras.main.startFollow(player);
        //set loop actions
        loopIndex = 0;
        loopActions = [action.JUMP, action.FIRE, action.JUMP]; //, action.FIRE, action.JUMP, action.FIRE]
        loopActionReady = [];
        loopImages = [];
        //create projectile group
        projectiles = this.physics.add.group({ key: 'projectiles', immovable: true, allowGravity: false });
        projectiles.createMultiple({ classType: phaser_1["default"].Physics.Arcade.Sprite, quantity: 10, active: false, visible: false, key: 'fireball_animation' });
        //foreground layers in front of player
        layer1b = map.createStaticLayer('ForegroundLayer', tileset, 0, 0);
        //create UI elements
        actionRing = this.add.sprite(ringCenter.x, ringCenter.y, 'ring');
        actionRing.setScrollFactor(0, 0);
        this.initLoopUI();
        ringSelect = this.add.sprite(ringCenter.x, ringCenter.y, 'ring_select');
        ringSelect.setScrollFactor(0, 0);
        //COLLISIONS
        //player x layer1
        layer1.setCollisionBetween(0, 99);
        this.physics.add.collider(player, layer1);
        //fireball x layer1
        this.physics.add.collider(projectiles, layer1, function (projectile, tile) {
            projectile.anims.play('poof', true);
            projectile.setVelocityX(0);
            projectile.once(phaser_1["default"].Animations.Events.SPRITE_ANIMATION_COMPLETE, function () {
                projectile.setActive(false);
                projectile.setVisible(false);
                projectile.setPosition(0, 0);
                projectile.body.velocity.x = 0;
            });
        });
        //fireball x crate
        this.physics.add.collider(crates, projectiles, function (crate, projectile) { }, function (crate, projectile) {
            projectile.anims.play('poof', true);
            projectile.setVelocityX(0);
            projectile.setInteractive(false);
            projectile.once(phaser_1["default"].Animations.Events.SPRITE_ANIMATION_COMPLETE, function () {
                projectile.setActive(false);
                projectile.setVisible(false);
                projectile.setPosition(0, 0);
            });
            crate.anims.play('cratePoof', true);
            if (!cratebreak_sound.isPlaying)
                cratebreak_sound.play();
            crate.setInteractive(false);
            crate.once(phaser_1["default"].Animations.Events.SPRITE_ANIMATION_COMPLETE, function () {
                crate.destroy();
            });
        });
        //player x crate
        this.physics.add.collider(player, cratesGroup, function (p, c) {
            //player on top of crate
            //if(c.body.touching.up == true) {
            //p.body.velocity.y = 0
            //p.body.y = c.body.position.y - p.height
            //c.body.velocity.y = 0
            //}
            if (c.body.touching.left == true || c.body.touching.right == true) {
                p.body.velocity.x = p.body.velocity.x * 0.1;
                c.body.velocity.x = p.body.velocity.x;
            }
        });
        //crate x layer1
        this.physics.add.collider(crates, layer1, function (c, t) {
            //c.body.velocity.x = 0
            //if(c.body.touching.down) {
            //    c.body.position.y = t.body.position.y - c.height
            //}
            c.body.velocity.x = 0;
        });
        //crate x crate
        this.physics.add.collider(crates, crates, function () { }, function (c1, c2) {
            if (c1.body.x < c2.body.x) {
                c1.body.velocity.x -= 1;
                c2.body.velocity.x += 1;
            }
            else {
                c1.body.velocity.x += 1;
                c2.body.velocity.x -= 1;
            }
            c1.body.immovable = true;
            c2.body.immovable = true;
        });
        //keys
        key_space = this.input.keyboard.addKey(phaser_1["default"].Input.Keyboard.KeyCodes.SPACE);
        key_e = this.input.keyboard.addKey(phaser_1["default"].Input.Keyboard.KeyCodes.E);
        //audio
        music = this.sound.add('music', { volume: 0.4, loop: true });
        fire_sound = this.sound.add('fire_sfx', { volume: 0.2 });
        jump_sound = this.sound.add('jump_sfx');
        cratebreak_sound = this.sound.add('cratebreak_sfx', { volume: 0.05 });
        footsteps_sound = this.sound.add('footsteps_sfx', { volume: 0.1, loop: true });
        footsteps_sound.play();
        this.initAnimations();
        this.sound.pauseOnBlur = false;
        //if(!music.isPlaying)
        //music.play()
        var levelText = this.add.text(10, 684, 'Level ' + STAGE_LEVEL.toString(), { fontFamily: 'Georgia', fontSize: '28px' });
        levelText.setScrollFactor(0, 0);
    };
    GameScene.prototype.update = function (time, delta) {
        var _a, _b, _c, _d, _e, _f;
        var cursors = this.input.keyboard.createCursorKeys();
        var runVelocity = 100;
        var maxVel = 300;
        var knockbackVelocity = 800;
        var jumpVelocity = 560;
        //make crate immovable if touching and blocked on opposite sides...
        cratesGroup.children.iterate(function (crate) {
            //immovable check (between player and tilemap)
            if (crate.body.touching.left && crate.body.blocked.right) {
                console.log('aaaa');
                crate.body.immovable = true;
                return;
            }
            if (crate.body.touching.right && crate.body.blocked.left) {
                console.log('bbbb');
                crate.body.immovable = true;
                return;
            }
            //if I push on one side and the other is not blocked, it should move...
            if (crate.body.touching.right) {
                if (!crate.body.blocked.left && !crate.body.touching.right) {
                    crate.body.immovable = false;
                }
            }
            if (crate.body.touching.left) {
                if (!crate.body.blocked.right && !crate.body.touching.left) {
                    crate.body.immovable = false;
                }
            }
            if (crate.body.touching.none) {
                crate.body.immovable = false;
            }
        });
        //want to identify vibrating on top of a crate as NOT airborne
        var isGrounded = (player.body.touching.down || player.body.blocked.down) && (player.body.velocity.y < 27 || player.body.velocity.y > -27);
        var isAirborne = !isGrounded;
        //const isAirborne = player.body.velocity.y != 0 && !player.body.touching.down
        if (!isKnockback) {
            player.setVelocityX(player.body.velocity.x * 0.9);
            //no horizontal movement
            if (!((_a = cursors.right) === null || _a === void 0 ? void 0 : _a.isDown) && !((_b = cursors.left) === null || _b === void 0 ? void 0 : _b.isDown) && !isKnockback) {
                //could decide in here to play idle if velocity is 0, or slowdownrun if velocity != 0
                player.setVelocityX(player.body.velocity.x * 0.9);
                if (!isAirborne) {
                    if (player.body.velocity.x > -20 && player.body.velocity.x < 20)
                        player.anims.play('playerIdle', true);
                    else
                        player.anims.play('stopping', true);
                }
            }
            //move left
            if (((_c = cursors.left) === null || _c === void 0 ? void 0 : _c.isDown) && !isKnockback) {
                player.setVelocityX(phaser_1["default"].Math.Clamp(player.body.velocity.x - runVelocity, -maxVel, maxVel));
                player.flipX = true;
                player.body.setOffset(60, 20);
                if (!isAirborne) {
                    player.anims.play('playerMove', true);
                    footsteps_sound.resume();
                }
            }
            //move right
            if (((_d = cursors.right) === null || _d === void 0 ? void 0 : _d.isDown) && !isKnockback) {
                player.setVelocityX(phaser_1["default"].Math.Clamp(player.body.velocity.x + runVelocity, -maxVel, maxVel));
                player.flipX = false;
                player.body.setOffset(60, 20);
                if (!isAirborne) {
                    player.anims.play('playerMove', true);
                    footsteps_sound.resume();
                }
            }
            if ((!((_e = cursors.right) === null || _e === void 0 ? void 0 : _e.isDown) && !((_f = cursors.left) === null || _f === void 0 ? void 0 : _f.isDown)) || isKnockback || isAirborne)
                footsteps_sound.pause();
        }
        else {
            player.anims.play('playerRecoil', true);
        }
        //jump - ADD TIMER!!!
        //also fire now!
        if (phaser_1["default"].Input.Keyboard.JustDown(key_space)) {
            var modIndex = loopIndex % loopActions.length;
            //check if cooldown is up for ability!
            //if it is, do the ability, set false, and set cooldown callback
            if (loopActionReady[modIndex]) {
                loopActionReady[modIndex] = false;
                loopImages[modIndex].tint = 0x555555;
                var actionable_1 = false;
                loopActionReady.forEach(function (action) {
                    actionable_1 = actionable_1 || action;
                });
                if (!actionable_1)
                    player.tint = 0x888888;
                this.time.addEvent({
                    delay: 1000 * loopActions.length,
                    callback: function (index) {
                        loopActionReady[index] = true;
                        loopImages[index].clearTint();
                        player.clearTint();
                    },
                    args: [modIndex]
                });
                if (loopActions[modIndex] == action.JUMP) {
                    player.setVelocityY(-jumpVelocity);
                    jump_sound.play();
                }
                if (loopActions[modIndex] == action.FIRE) {
                    //spawn projectile in direction we are facing, apply set knockback to character
                    this.fireProjectile(player.x, player.y);
                    if (player.flipX)
                        player.setVelocityX(knockbackVelocity);
                    else
                        player.setVelocityX(-knockbackVelocity);
                    fire_sound.play();
                    knockbackTimer = this.time.delayedCall(250, this.unlockPlayerMovement); //disallow player input for x milliseconds
                    isKnockback = true;
                }
                loopIndex++;
                //set new positions for everything in the array!
                this.rotateLoopUI();
            }
            else {
                console.log('TELL PLAYER SOMETHING ABOUT CD???');
            }
        }
        //strong attack
        /*
        if(Phaser.Input.Keyboard.JustDown(key_e)) {
            //spawn projectile in direction we are facing, apply set knockback to character
            this.fireProjectile(player.x, player.y)
            if(player.flipX)
                player.setVelocityX(knockbackVelocity)
            else
                player.setVelocityX(-knockbackVelocity)
            fire_sound.play()
            knockbackTimer = this.time.delayedCall(400, this.unlockPlayerMovement) //disallow player input for x milliseconds
            isKnockback = true
        }
        */
        if (isAirborne) {
            if (player.body.velocity.y < 0)
                player.anims.play('playerJump', true);
            else
                player.anims.play('playerFall', true);
        }
        projectiles.getChildren().forEach(function (elem) {
            if (elem.body.x >= map.widthInPixels) {
                elem.setActive(false);
                elem.setVisible(false);
                elem.setPosition(0, 0);
                elem.body.velocity.x = 0;
            }
        });
        //kill player and restart level when below map
        if (player.body.y - player.body.height >= map.heightInPixels) {
            //PASS player spawn position HERE!!! for next level
            this.scene.restart({ STAGE_LEVEL: STAGE_LEVEL, playerX: 0, playerY: 0 });
        }
        //check win condition to move to next level!
        if (player.body.x + player.body.width >= map.widthInPixels) {
            this.registry.destroy();
            music.stop();
            if (STAGE_LEVEL == LEVEL_COUNT) {
                //you win!
                isKnockback = false;
                footsteps_sound.stop();
                this.scene.start('title-scene', { COMPLETED_GAME: true });
            }
            else {
                //next level
                isKnockback = false;
                this.scene.restart({ STAGE_LEVEL: STAGE_LEVEL + 1 });
            }
        }
    };
    GameScene.prototype.initAnimations = function () {
        //player animations
        this.anims.create({
            key: 'playerMove',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 11, 11, 11] }),
            frameRate: 22,
            repeat: -1
        });
        this.anims.create({
            key: 'playerJump',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [13, 14, 15] }),
            frameRate: 7,
            repeat: -1
        });
        this.anims.create({
            key: 'playerFall',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [15, 16] }),
            frameRate: 7,
            repeat: -1
        });
        this.anims.create({
            key: 'stopping',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [9] }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'playerIdle',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [0, 0, 1, 2, 3] }),
            frameRate: 7,
            repeat: -1
        });
        this.anims.create({
            key: 'playerRecoil',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [18, 19] }),
            frameRate: 7,
            repeat: -1
        });
        //projectile animation
        this.anims.create({
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('fireball_animation', { start: 0, end: 7 }),
            frameRate: 44,
            repeat: -1
        });
        this.anims.create({
            key: 'poof',
            frames: this.anims.generateFrameNumbers('fireball_animation', { start: 8, end: 15 }),
            frameRate: 44 //44
        });
        //crate poof animation
        this.anims.create({
            key: 'cratePoof',
            frames: this.anims.generateFrameNumbers('crate', { start: 1, end: 3 }),
            frameRate: 7 //44
        });
        //fire icon animation
        this.anims.create({
            key: 'firecharge',
            frames: this.anims.generateFrameNumbers('fire_icon_animation', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        //find all the fire sprites in loopImages and start them up
        loopActions.forEach(function (elem, index) {
            if (elem == action.FIRE)
                loopImages[index].play('firecharge', true);
        });
    };
    GameScene.prototype.fireProjectile = function (x, y) {
        //could run out... but should always have one available!
        var fireVelocity = 600;
        var p = projectiles.getFirstDead();
        p.setBodySize(50, 50);
        p.body.reset(x, y);
        p.setActive(true);
        p.setVisible(true);
        p.flipX = player.flipX;
        if (player.flipX) {
            p.setVelocityX(-fireVelocity);
            p.setOffset(10, 118);
        }
        else {
            p.setVelocityX(fireVelocity);
            p.setOffset(100, 118);
        }
        p.anims.play('shoot', true);
    };
    GameScene.prototype.unlockPlayerMovement = function () {
        isKnockback = false;
    };
    GameScene.prototype.initLoopUI = function () {
        var _this = this;
        //dynamically create icons for loop actions
        loopActions.forEach(function (elem, index) {
            var x = index * 150 + 100;
            var y = 100;
            var iconSprite;
            //list of items handled by timers to indicate if they are actionable or not yet!
            loopActionReady.push(true);
            if (elem == action.JUMP) {
                iconSprite = _this.add.sprite(x, y, 'jump_icon');
            }
            else { //elem == action.FIRE
                iconSprite = _this.add.sprite(x, y, 'fire_icon_animation');
                iconSprite.setSize(80, 80);
                //iconSprite.setOffset(49, 20)
            }
            iconSprite.setScrollFactor(0, 0);
            loopImages.push(iconSprite);
            var actionNumText = _this.add.text(x - 10, y - 90, (index + 1).toString(), { fontFamily: 'Georgia', fontSize: '42px' });
            actionNumText.setScrollFactor(0, 0);
        });
    };
    //rotate icons around center, with distance of radius
    GameScene.prototype.rotateLoopUI = function () {
        var _this = this;
        //rotation amount is 2*PI / loopImages.length
        var rotateAmount = 2 * Math.PI / loopImages.length;
        loopImages.forEach(function (elem, index) {
            _this.tweens.add({
                targets: elem,
                duration: 500,
                ease: 'Sine.easeOut',
                x: function () { return ringCenter.x + ringImageRadius * Math.cos(rotateAmount * (loopIndex - index)); },
                y: function () { return ringCenter.y + ringImageRadius * Math.sin(rotateAmount * (loopIndex - index)) - 10; }
            });
        });
    };
    return GameScene;
}(phaser_1["default"].Scene));
exports["default"] = GameScene;
