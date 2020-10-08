import Phaser, { GameObjects, Physics } from 'phaser'


enum action {
    JUMP = 1,
    FIRE
}

const LEVEL_COUNT = 2
let STAGE_LEVEL: integer
let playerX: integer
let playerY: integer
let playerWidth = 80
let playerHeight = 160 - 40

let playerOffsetRight = 60
let playerOffsetLeft = 60
let playerOffsetY = 20 + 40

let bg: GameObjects.Image
let cave_1: GameObjects.Image
let cave_2: GameObjects.Image
let cave_3: GameObjects.Image
let cave_4: GameObjects.Image
let cave_5: GameObjects.Image



//player
let player: Phaser.Physics.Arcade.Sprite
let isKnockback = false
let knockbackTimer: Phaser.Time.TimerEvent

//loop actions
let loopIndex: integer
let loopActions: integer[]
let loopActionReady: boolean[]
let loopImages: Phaser.GameObjects.Sprite[]

//ui elements
let ringCenter: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1150, 130)
let ringImageRadius: integer = 60
let actionRing: Phaser.GameObjects.Sprite
let ringSelect: Phaser.GameObjects.Sprite

//map
let map: Phaser.Tilemaps.Tilemap

//layers
let layer1b: Phaser.Tilemaps.StaticTilemapLayer
let layer1: Phaser.Tilemaps.StaticTilemapLayer
let layer2: Phaser.Tilemaps.StaticTilemapLayer
let layer3: Phaser.Tilemaps.StaticTilemapLayer
let crates: Phaser.GameObjects.Sprite[]


//player projectiles
let projectiles: Phaser.GameObjects.Group

//crate group
let cratesGroup: Phaser.GameObjects.Group

//keyboard variables
let key_space: Phaser.Input.Keyboard.Key
let key_e: Phaser.Input.Keyboard.Key

//audio
let music: Phaser.Sound.BaseSound
let fire_sound: Phaser.Sound.BaseSound
let jump_sound: Phaser.Sound.BaseSound
let cratebreak_sound: Phaser.Sound.BaseSound
let footsteps_sound: Phaser.Sound.BaseSound

export default class GameScene extends Phaser.Scene
{
	constructor(STAGE_LEVEL: integer)
	{
		super('game-scene')
    }

    init(data)
    {
        STAGE_LEVEL = data.STAGE_LEVEL
        playerX = data.playerX
        playerY = data.playerY
    }
    
	preload()
    {
        console.log('level: ', STAGE_LEVEL)

        this.load.tilemapTiledJSON('map1', 'magetiles1.json')
        this.load.tilemapTiledJSON('map2', 'magetiles2.json')
        //this.load.tilemapTiledJSON('map3', 'magetiles3.json')

        //this.load.image('bg', 'cave_bg_fit.png')
        this.load.image('bg', 'bg/bg.png')
        this.load.image('cave_1', 'bg/cave_1.png')
        this.load.image('cave_2', 'bg/cave_2.png')
        this.load.image('cave_3', 'bg/cave_3.png')
        this.load.image('cave_4', 'bg/cave_4.png')
        this.load.image('cave_5', 'bg/cave_5.png')

        //this.load.image('magetiles', 'magetiles.png')
        this.load.image('magetiles-extruded', 'magetiles-extruded.png')
        this.load.spritesheet('mage_animation', 'mageanimations.png', { frameWidth: 173, frameHeight: 186 })
        this.load.spritesheet('fireball_animation', 'fireballanimationfull.png', { frameWidth: 160, frameHeight: 308 })
        this.load.spritesheet('crate', 'cratepoof.png', { frameWidth: 160, frameHeight: 160 })
        //this.load.image('crate', 'crate.png')

        //UI elements
        this.load.image('ring', 'ring.png')
        this.load.image('ring_select', 'ringselect.png')
        this.load.image('jump_icon', 'jumparrowsolid.png')
        this.load.spritesheet('fire_icon_animation', 'firecharge.png', { frameWidth: 51, frameHeight: 90 })

        //audio
        this.load.audio('music', 'music/library.ogg')
        this.load.audio('fire_sfx', 'sfx/fireballs/Fireball1.ogg')
        this.load.audio('jump_sfx', 'sfx/landing/Landing.ogg')
        this.load.audio('cratebreak_sfx', 'sfx/crate/cratebreak.ogg')
        this.load.audio('footsteps_sfx', 'sfx/footsteps/footsteps.ogg')
    }

    create()
    {
        let xOrigin = 0
        let yOrigin = 0
        //set large bg
        bg = this.add.image(890, 610, 'bg')
        bg.setScrollFactor(0)
        //bg.setOrigin(890, 610)

        //set 1280x720 bg
        //bg = this.add.image(640, 360, 'bg')


        //set layers at top left?
        cave_5 = this.add.image(0, 0, 'cave_5')
        cave_4 = this.add.image(0, 0, 'cave_4')
        cave_3 = this.add.image(0, 0, 'cave_3')
        cave_2 = this.add.image(0, 0, 'cave_2')
        cave_1 = this.add.image(0, 0, 'cave_1')

        cave_1.setOrigin(xOrigin, yOrigin)
        cave_2.setOrigin(xOrigin, yOrigin)
        cave_3.setOrigin(xOrigin, yOrigin)
        cave_4.setOrigin(xOrigin, yOrigin)
        cave_5.setOrigin(xOrigin, yOrigin)

        //joel settings
        //cave_1.setScrollFactor(0.8)
        //cave_2.setScrollFactor(0.4)
        //cave_3.setScrollFactor(0.2)
        //cave_4.setScrollFactor(0.1)
        //cave_5.setScrollFactor(0.05)

        cave_1.setScrollFactor(0.6)
        cave_2.setScrollFactor(0.4)
        cave_3.setScrollFactor(0.2)
        cave_4.setScrollFactor(0.1)
        cave_5.setScrollFactor(0.05)


        map = this.make.tilemap({ key: 'map' + STAGE_LEVEL })

        //EXTRUDED
        const tileset = map.addTilesetImage('magetiles', 'magetiles-extruded', 80, 80, 1, 2) //grab the tiled tileset file "tileset" from "tiles" image file
        //NON-EXTRUDED
        //const tileset = map.addTilesetImage('magetiles', 'magetiles') //grab the tiled tileset file "tileset" from "tiles" image file

        layer1 = map.createStaticLayer('CollideLayer', tileset, 0, 0)
        layer2 = map.createStaticLayer('BehindLayer', tileset, 0, 0)
        crates = map.createFromObjects('Crates', 'crate', { key: 'crate' })
        //this.physics.world.enable(crates)

        cratesGroup = this.add.group(crates)
        this.physics.world.enable(cratesGroup)

        ///player
        player = this.physics.add.sprite(playerX, playerY, 'mage_animation')
        player.body.setSize(50, playerHeight)
        player.body.setOffset(playerOffsetRight, playerOffsetY)
        player.setOrigin(0.5)
        player.setMaxVelocity(800, 600)

        //set camera and follow player
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels) //bg.displayWidth, bg.displayHeight)
        this.cameras.main.startFollow(player)

        //set loop actions
        loopIndex = 0
        loopActions = [action.JUMP, action.FIRE, action.JUMP]//, action.FIRE, action.JUMP, action.FIRE]
        loopActionReady = []
        loopImages = []

        //create projectile group
        projectiles = this.physics.add.group({key: 'projectiles', immovable: true, allowGravity: false})
        projectiles.createMultiple({ classType: Phaser.Physics.Arcade.Sprite, quantity: 10, active: false, visible: false, key: 'fireball_animation' })

        //foreground layers in front of player
        layer1b = map.createStaticLayer('ForegroundLayer', tileset, 0, 0)

        //create UI elements
        actionRing = this.add.sprite(ringCenter.x, ringCenter.y, 'ring')
        actionRing.setScrollFactor(0, 0)

        this.initLoopUI() 

        ringSelect = this.add.sprite(ringCenter.x, ringCenter.y, 'ring_select')
        ringSelect.setScrollFactor(0, 0)


        //COLLISIONS

        //player x layer1
        layer1.setCollisionBetween(0,99)
        this.physics.add.collider(player, layer1)


        //fireball x layer1
        this.physics.add.collider(projectiles, layer1, function(projectile, tile) {
            let p1 = <Phaser.Physics.Arcade.Sprite> projectile
            p1.anims.play('poof', true)
            p1.setVelocityX(0)
            p1.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
                p1.setActive(false)
                p1.setVisible(false)
                p1.setPosition(0, 0)
                p1.body.velocity.x = 0
            })
        })

        //fireball x crate
        this.physics.add.collider(crates, projectiles, function(crate, projectile) { }, function(crate, projectile) {
            let c1 = <Phaser.Physics.Arcade.Sprite> crate
            let p1 = <Phaser.Physics.Arcade.Sprite> projectile
            p1.anims.play('poof', true)
            p1.setVelocityX(0)
            p1.setInteractive(false)
            p1.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
                p1.setActive(false)
                p1.setVisible(false)
                p1.setPosition(0, 0)
            })

            c1.anims.play('cratePoof', true)
            if(!cratebreak_sound.isPlaying)
                cratebreak_sound.play()
            c1.setInteractive(false)
            c1.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
                c1.destroy()
            })
        })

        //player x crate
        this.physics.add.collider(player, cratesGroup, function(player, crate) {
            let p1 = <Phaser.Physics.Arcade.Sprite> player
            let c1 = <Phaser.Physics.Arcade.Sprite> crate
            //player on top of crate
            //if(c.body.touching.up == true) {
                //p.body.velocity.y = 0
                //p.body.y = c.body.position.y - p.height
                //c.body.velocity.y = 0
            //}


            if(c1.body.touching.left || c1.body.touching.right) {
                p1.body.velocity.x = p1.body.velocity.x * 0.5 //c1.body.velocity.x
                //c1.body.velocity.x = -p1.body.velocity.x/p1.body.velocity.x
            }
        })

        this.physics.add.overlap(player, cratesGroup, function(player, crate) {
            let p1 = <Phaser.Physics.Arcade.Sprite> player
            let c1 = <Phaser.Physics.Arcade.Sprite> crate


            if(c1.body.touching.up)
                p1.setGravityY(0)

            let vertThreshold = 4
            if((p1.body.touching.up || p1.body.touching.down) && p1.body.bottom - vertThreshold < c1.body.top) {
                return
            }

            if(p1.body.touching.left || p1.body.touching.right) {
                if(p1.body.center.x < c1.body.center.x) {
                    p1.body.position.x = c1.body.center.x - c1.body.halfWidth - p1.body.width
                }
                else {
                    p1.body.position.x = c1.body.center.x + c1.body.halfWidth// + p1.body.width
                }
            }
        })


        //crate x layer1
        this.physics.add.collider(crates, layer1, function(crate, tile) {
            //console.log('OOF')
            let c1 = <Phaser.Physics.Arcade.Sprite>crate

            if(c1.body.blocked.down) {
                c1.body.velocity.x = c1.body.velocity.x * 0.8
            }
            //c.body.velocity.x = 0
            //if(c.body.touching.down) {
            //    c.body.position.y = t.body.position.y - c.height
            //}
            //c1.body.velocity.x = 0
        })

        //crate x crate
        this.physics.add.collider(crates, crates, ()=>{}, function(crate1, crate2) {
            let c1 = <Phaser.Physics.Arcade.Sprite>crate1
            let c2 = <Phaser.Physics.Arcade.Sprite>crate2

            if(c1.body.x < c2.body.x) {
                c1.body.velocity.x -= 1
                c2.body.velocity.x += 1
            }
            else {
                c1.body.velocity.x += 1
                c2.body.velocity.x -= 1
            }
            c1.body.immovable = true
            c2.body.immovable = true
        })
        


        //keys
        key_space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        key_e = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)

        //audio
        music = this.sound.add('music', { volume: 0.4, loop: true })
        fire_sound = this.sound.add('fire_sfx', { volume: 0.2 })
        jump_sound = this.sound.add('jump_sfx')
        cratebreak_sound = this.sound.add('cratebreak_sfx', { volume: 0.05 })
        footsteps_sound = this.sound.add('footsteps_sfx', { volume: 0.1, loop: true })
        footsteps_sound.play()

        this.initAnimations()
        this.sound.pauseOnBlur = false
        if(!music.isPlaying) {
            music.play()
        }

        let levelText = this.add.text(10, 684, 'Level ' + STAGE_LEVEL.toString(), { fontFamily: 'Georgia', fontSize: '28px' })
        levelText.setScrollFactor(0, 0)
    }

    update(time, delta)
    {

        const cursors = this.input.keyboard.createCursorKeys()
        const runVelocity = 100
        const maxVel = 300
        const knockbackVelocity = 800
        const jumpVelocity = 620


        //make crate immovable if touching and blocked on opposite sides...
        cratesGroup.children.iterate(function(crate) {
            let c1 = <Phaser.Physics.Arcade.Sprite>crate

            //immovable check (between player and tilemap)
            if(c1.body.touching.left && c1.body.blocked.right) {
                c1.body.immovable = true
                return
            }
            if(c1.body.touching.right && c1.body.blocked.left) {
                c1.body.immovable = true
                return
            }

            //if I push on one side and the other is not blocked, it should move...
            if(c1.body.touching.right) {
                if(!c1.body.blocked.left && !c1.body.touching.right) {
                    c1.body.immovable = false
                }
            }
            if(c1.body.touching.left) {
                if(!c1.body.blocked.right && !c1.body.touching.left) {
                    c1.body.immovable = false
                }
            }

            if(c1.body.touching.none) {
                c1.body.immovable = false
            }

        })

        

        //want to identify vibrating on top of a crate as NOT airborne

        const isGrounded = (player.body.touching.down || player.body.blocked.down) && (player.body.velocity.y < 27 || player.body.velocity.y > -27)
        const isAirborne = !isGrounded
        //const isAirborne = player.body.velocity.y != 0 && !player.body.touching.down


        if(!isKnockback) {
            player.setVelocityX(player.body.velocity.x * 0.9)
        
            //no horizontal movement
            if(!cursors.right?.isDown && !cursors.left?.isDown && !isKnockback) {
                //could decide in here to play idle if velocity is 0, or slowdownrun if velocity != 0
                player.setVelocityX(player.body.velocity.x * 0.9)

                if(!isAirborne) {
                    if(player.body.velocity.x > -20 && player.body.velocity.x < 20)
                        player.anims.play('playerIdle', true)
                    else
                        player.anims.play('stopping', true)
                }
            }
            //move left
            if(cursors.left?.isDown && !isKnockback) {
                player.setVelocityX(Phaser.Math.Clamp(player.body.velocity.x - runVelocity, -maxVel, maxVel))
                player.flipX = true;
                player.body.setOffset(playerOffsetLeft, playerOffsetY)

                //halt player movement if they run into a crate
                //if(player.body.touching.left)
                //    player.setVelocityX(0)

                if(!isAirborne) {
                    player.anims.play('playerMove', true)
                    footsteps_sound.resume()
                }
            }
            //move right
            if(cursors.right?.isDown && !isKnockback) {
                player.setVelocityX(Phaser.Math.Clamp(player.body.velocity.x + runVelocity, -maxVel, maxVel))
                player.flipX = false;
                player.body.setOffset(playerOffsetRight, playerOffsetY)

                //halt player movement if they run into a crate
                //if(player.body.touching.right)
                //    player.setVelocityX(0)

                if(!isAirborne) {
                    player.anims.play('playerMove', true)
                    footsteps_sound.resume()
                }
            }
            if((!cursors.right?.isDown && !cursors.left?.isDown) || isKnockback || isAirborne)
            footsteps_sound.pause()
        }
        else {
            player.anims.play('playerRecoil', true)
            if(player.body.touching.left || player.body.touching.right)
                player.setVelocityX(0)
        }

        //jump - ADD TIMER!!!
        //also fire now!
        if(Phaser.Input.Keyboard.JustDown(key_space)) {
            let modIndex = loopIndex % loopActions.length
            
            //check if cooldown is up for ability!
            //if it is, do the ability, set false, and set cooldown callback

            if(loopActionReady[modIndex]) {
                loopActionReady[modIndex] = false
                loopImages[modIndex].tint = 0x555555

                let actionable = false
                loopActionReady.forEach(action => {
                    actionable = actionable || action
                })

                if(!actionable)
                    player.tint = 0x888888

                this.time.addEvent({
                    delay: 800 * loopActions.length, //1 second per move on average
                    callback: (index) => {
                        loopActionReady[index] = true
                        loopImages[index].clearTint()
                        player.clearTint()
                    },
                    args: [modIndex]
                })

                if(loopActions[modIndex] == action.JUMP) {
                    player.setVelocityY(-jumpVelocity)
                    jump_sound.play()
                }
                if(loopActions[modIndex] == action.FIRE) {
                    //spawn projectile in direction we are facing, apply set knockback to character
                    this.fireProjectile(player.x, player.y)
                    if(player.flipX)
                        player.setVelocityX(knockbackVelocity)
                    else
                        player.setVelocityX(-knockbackVelocity)
                    fire_sound.play()
                    knockbackTimer = this.time.delayedCall(250, this.unlockPlayerMovement) //disallow player input for x milliseconds
                    isKnockback = true
                }
                loopIndex++

                //set new positions for everything in the array!
                this.rotateLoopUI()
            }
            else {
                console.log('TELL PLAYER SOMETHING ABOUT CD???')
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

        if(isAirborne) {
            if(player.body.velocity.y < 0)
                player.anims.play('playerJump', true)
            else
                player.anims.play('playerFall', true)
        }

        projectiles.getChildren().forEach(projectile => {
            let p1 = <Phaser.Physics.Arcade.Sprite>projectile
            if(p1.body.x >= map.widthInPixels) {
                p1.setActive(false)
                p1.setVisible(false)
                p1.setPosition(0, 0)
                p1.body.velocity.x = 0
            }
        })

        //kill player and restart level when below map
        if(player.body.y - player.body.height >= map.heightInPixels) {
            //PASS player spawn position HERE!!! for next level

            this.scene.restart({ STAGE_LEVEL: STAGE_LEVEL, playerX: playerX, playerY: playerY })
        }
        //check win condition to move to next level!
        if(player.body.x + player.body.width >= map.widthInPixels) {
            this.registry.destroy()
            music.stop()
            if(STAGE_LEVEL == LEVEL_COUNT) {
                //you win!
                isKnockback = false
                footsteps_sound.stop()  
                this.scene.start('title-scene', { COMPLETED_GAME: true })
            }
            else {
                //next level
                isKnockback = false
                this.scene.restart({ STAGE_LEVEL: STAGE_LEVEL + 1, playerX: 160, playerY: 900})
            }
        }
    }

    initAnimations() {
        //player animations
        this.anims.create({
            key: 'playerMove',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 11, 11, 11] }),
            frameRate: 22,
            repeat: -1
        })
        this.anims.create({
            key: 'playerJump',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [13,14,15] }), //12-14
            frameRate: 7,
            repeat: -1
        })
        this.anims.create({
            key: 'playerFall',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [15,16] }), //15-16
            frameRate: 7,
            repeat: -1
        })
        this.anims.create({
            key: 'stopping',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [9] }),
            frameRate: 1,
            repeat: -1
        })
        this.anims.create({
            key: 'playerIdle',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [0,0,1,2,3] }),
            frameRate: 7,
            repeat: -1
        })
        this.anims.create({
            key: 'playerRecoil',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [18,19] }),
            frameRate: 7,
            repeat: -1
        })

        //projectile animation
        this.anims.create({
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('fireball_animation', { start: 0, end: 7 }),
            frameRate: 44,
            repeat: -1
        })
        this.anims.create({
            key: 'poof',
            frames: this.anims.generateFrameNumbers('fireball_animation', { start: 8, end: 15 }),
            frameRate: 44 //44
        })

        //crate poof animation
        this.anims.create({
            key: 'cratePoof',
            frames: this.anims.generateFrameNumbers('crate', { start: 1, end: 3 }),
            frameRate: 7 //44
        })

        //fire icon animation
        this.anims.create({
            key: 'firecharge',
            frames: this.anims.generateFrameNumbers('fire_icon_animation', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        })

        //find all the fire sprites in loopImages and start them up
        loopActions.forEach((elem, index) => {
            if(elem == action.FIRE)
                loopImages[index].play('firecharge', true)
        })
    }

    fireProjectile(x: integer, y: integer) {
        //could run out... but should always have one available!
        const fireVelocity = 600
        const p : Phaser.Physics.Arcade.Sprite = projectiles.getFirstDead()
        p.setBodySize(50, 50)
        p.body.reset(x, y)
        p.setActive(true)
        p.setVisible(true)
        p.flipX = player.flipX
        if(player.flipX) {
            p.setVelocityX(-fireVelocity)
            p.setOffset(10, 118)
        }
        else {
            p.setVelocityX(fireVelocity)
            p.setOffset(100, 118)
        }
        p.anims.play('shoot', true)
    }

    unlockPlayerMovement() {
        isKnockback = false
    }

    initLoopUI() {
        //dynamically create icons for loop actions
        loopActions.forEach((elem, index) => {
            let x = index*150 + 100
            let y = 100
            let iconSprite: Phaser.GameObjects.Sprite

            //list of items handled by timers to indicate if they are actionable or not yet!
            loopActionReady.push(true)

            if(elem == action.JUMP) {
                iconSprite = this.add.sprite(x, y, 'jump_icon')
            }
            else { //elem == action.FIRE
                iconSprite = this.add.sprite(x, y, 'fire_icon_animation')
                iconSprite.setSize(80, 80)
                //iconSprite.setOffset(49, 20)
            }
            iconSprite.setScrollFactor(0, 0)
            loopImages.push(iconSprite)
            let actionNumText = this.add.text(x-10, y-90, (index+1).toString(), { fontFamily: 'Georgia', fontSize: '42px'})
            actionNumText.setScrollFactor(0, 0)
        })
    }

    //rotate icons around center, with distance of radius
    rotateLoopUI() {
        //rotation amount is 2*PI / loopImages.length
        let rotateAmount = 2*Math.PI / loopImages.length

        loopImages.forEach((elem, index) => {
            this.tweens.add({
                targets: elem,
                duration: 500,
                ease: 'Sine.easeOut',
                x: () => { return ringCenter.x + ringImageRadius * Math.cos(rotateAmount * (loopIndex-index)) },
                y: () => { return ringCenter.y + ringImageRadius * Math.sin(rotateAmount * (loopIndex-index)) - 10 }
            })
        })
    }
}