import { Vector } from 'matter'
import Phaser, { GameObjects, Physics } from 'phaser'


enum action {
    JUMP = 1,
    FIRE
}

let bg: GameObjects.Image

//player
let player: Phaser.Physics.Arcade.Sprite
let isJumping: boolean
let isKnockback: boolean
let knockbackTimer: Phaser.Time.TimerEvent

//loop actions
let loopIndex: integer
let loopActions: integer[]
let loopActionReady: boolean[]
let loopImages: Phaser.GameObjects.Sprite[]

//ui elements
let ringCenter: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1130, 150)
let ringImageRadius: integer = 100
let actionRing: Phaser.GameObjects.Sprite
let jumpIcon: Phaser.GameObjects.Sprite
let fireIcon: Phaser.GameObjects.Sprite

//layers
let layer1: Phaser.Tilemaps.StaticTilemapLayer
let layer2: Phaser.Tilemaps.StaticTilemapLayer
let layer3: Phaser.Tilemaps.StaticTilemapLayer


//player projectiles
let projectiles: Phaser.GameObjects.Group

//keyboard variables
let key_space: Phaser.Input.Keyboard.Key
let key_e: Phaser.Input.Keyboard.Key

//audio
let fire_sound: Phaser.Sound.BaseSound
let jump_sound: Phaser.Sound.BaseSound

export default class TileMapScene extends Phaser.Scene
{
	constructor()
	{
		super('tilemap-scene')
    }
    
	preload()
    {
        //follow path!!
        this.load.plugin('rexpathfollowerplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpathfollowerplugin.min.js', true);

        this.load.image('bg', 'bg.png')
        this.load.image('magetiles', 'magetiles.png')
        this.load.tilemapTiledJSON('map', 'magetiles.json')
        this.load.spritesheet('mage_animation', 'mageanimations.png', { frameWidth: 173, frameHeight: 186 })
        this.load.spritesheet('fireball_animation', 'fireball.png', { frameWidth: 200, frameHeight: 106 })

        //UI elements
        this.load.image('ring', 'ring.png')
        this.load.image('jump_icon', 'jumparrow2.png')
        this.load.spritesheet('fire_icon_animation', 'firecharge.png', { frameWidth: 51, frameHeight: 90 })

        //audio
        this.load.audio('fire_sfx', 'sfx/fireballs/Fireball1.wav')
        this.load.audio('jump_sfx', 'sfx/landing/Landing.wav')
    }

    create()
    {
        //set bg
        bg = this.add.image(890, 610, 'bg')

        const map = this.make.tilemap({key:'map'})
        const tileset = map.addTilesetImage('magetiles', 'magetiles') //grab the tiled tileset file "tileset" from "tiles" image file

        layer1 = map.createStaticLayer('Tile Layer 1', tileset, 0, 0)
        layer2 = map.createStaticLayer('Tile Layer 2', tileset, 0, 0)


        //map.setCollisionByProperty({ collides: true })

        ///player
        player = this.physics.add.sprite(80 + 160/2, 440, 'mage_animation')
        player.body.setSize(76, 160)
        player.body.setOffset(49, 20)
        //player.setBounce(0.2)
        //player.setFrictionX(0.9)
        //player.setMaxVelocity(500, 500)

        //set camera and follow player
        this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight)
        this.cameras.main.startFollow(player)

        //create UI elements
        actionRing = this.add.sprite(ringCenter.x, ringCenter.y, 'ring')
        actionRing.setScrollFactor(0, 0)
        //jumpIcon = this.add.sprite(ringCenter.x - 100, ringCenter.y, 'jump_icon')
        //fireIcon = this.add.sprite(ringCenter.x + 100, ringCenter.y, 'fire_icon_animation')

        //set loop actions
        loopIndex = 0
        loopActions = [action.JUMP, action.FIRE, action.JUMP]//, action.FIRE, action.JUMP, action.FIRE]
        loopActionReady = []
        loopImages = []

        this.initLoopUI() 

        //set player bools
        isJumping = false
        isKnockback = false

        //create projectile group
        projectiles = this.physics.add.group({key: 'projectiles', immovable: true, allowGravity: false})
        projectiles.createMultiple({ classType: Phaser.Physics.Arcade.Sprite, quantity: 10, active: false, visible: false, key: 'fireball_animation' })

        //COLLISIONS

        //player x layer1
        layer1.setCollisionBetween(0,99)
        this.physics.add.collider(player, layer1)

        //fireball x layer1
        this.physics.add.collider(projectiles, layer1, this.projectileTileCollide)


        //DESTROY OFF-SCREEN PROJECTILES!!!!!





        
        this.initAnimations()

        

        ///


        //keys
        key_space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        key_e = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)

        //audio
        fire_sound = this.sound.add('fire_sfx')
        jump_sound = this.sound.add('jump_sfx')
    }

    update(time, delta)
    {
        const cursors = this.input.keyboard.createCursorKeys()
        const runVelocity = 100
        const maxVel = 300
        const knockbackVelocity = 800
        const jumpVelocity = 500

        if(!isKnockback) {
            player.setVelocityX(player.body.velocity.x * 0.9)
        
            //no horizontal movement
            if(!cursors.right?.isDown && !cursors.left?.isDown && !isKnockback) {
                //could decide in here to play idle if velocity is 0, or slowdownrun if velocity != 0
                player.setVelocityX(player.body.velocity.x * 0.9)
                player.anims.play('playerIdle', true)
            }
            //move right
            if(cursors.right?.isDown && !isKnockback) {
                player.setVelocityX(Phaser.Math.Clamp(player.body.velocity.x + runVelocity, -maxVel, maxVel))
                player.flipX = false;
                player.anims.play('playerMove', true)
            }
            //move left
            if(cursors.left?.isDown && !isKnockback) {
                player.setVelocityX(Phaser.Math.Clamp(player.body.velocity.x - runVelocity, -maxVel, maxVel))
                player.flipX = true;
                player.anims.play('playerMove', true)
            }
        }

        //jump - ADD TIMER!!!
        //also fire now!
        if(Phaser.Input.Keyboard.JustDown(key_space)) {
            let modIndex = loopIndex % loopActions.length
            if(loopActions[modIndex] == action.JUMP) {
                isJumping = true
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
        //strong attack
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
            key: 'playerIdle',
            frames: this.anims.generateFrameNumbers('mage_animation', { frames: [0,0,1,2,3] }),
            frameRate: 7,
            repeat: -1
        })

        //projectile animation
        this.anims.create({
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('fireball_animation', { start: 0, end: 7 }),
            frameRate: 22,
            repeat: -1
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
        p.body.reset(x, y)
        p.setActive(true)
        p.setVisible(true)
        p.flipX = player.flipX
        if(player.flipX)
            p.setVelocityX(-fireVelocity)
        else
            p.setVelocityX(fireVelocity)
        p.anims.play('shoot', true)
    }
    
    projectileTileCollide(projectile) {
        projectile.setActive(false)
        projectile.setVisible(false)
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

            //list of items handled by timers t/knocko indicate if they are actionable or not yet!
            loopActionReady.push(true)

            if(elem == action.JUMP) {
                iconSprite = this.add.sprite(x, y, 'jump_icon')
            }
            else { //elem == action.FIRE
                iconSprite = this.add.sprite(x, y, 'fire_icon_animation')
            }
            iconSprite.setScrollFactor(0, 0)
            loopImages.push(iconSprite)
            this.add.text(x-10, y-90, (index+1).toString(), { fontFamily: 'Georgia', fontSize: '42px'})
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
                y: () => { return ringCenter.y + ringImageRadius * Math.sin(rotateAmount * (loopIndex-index)) }
            })
        })
    }
}


