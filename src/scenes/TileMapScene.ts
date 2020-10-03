import { Vector } from 'matter'
import Phaser, { GameObjects } from 'phaser'


enum action {
    JUMP = 1,
    FIRE
}

//player
let player: Phaser.Physics.Arcade.Sprite
let isJumping: boolean
let isKnockback: boolean
let knockbackTimer: Phaser.Time.TimerEvent

//loop actions
let loopIndex: integer
let loopActions: integer[]
let loopImages: Phaser.GameObjects.Sprite[]

//ui elements
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
        this.load.image('bg', 'bg.png')
        this.load.image('tiles', 'assetTiles.png')
        this.load.tilemapTiledJSON('map', 'level1.json')
        this.load.spritesheet('fox_animation', 'magerun192.png', { frameWidth: 192, frameHeight: 206 })
        this.load.spritesheet('fireball_animation', 'fireball.png', { frameWidth: 55, frameHeight: 55 })

        //UI elements
        this.load.image('ring', 'ring.png')
        this.load.image('jump_icon', 'jumparrow.png')
        this.load.spritesheet('fire_icon_animation', 'firecharge.png', { frameWidth: 51, frameHeight: 90 })

        //audio
        this.load.audio('fire_sfx', 'sfx/fireballs/Fireball1.wav')
        this.load.audio('jump_sfx', 'sfx/landing/Landing.wav')
    }

    create()
    {
        //set bg
        this.add.image(0, 0, 'bg')

        const map = this.make.tilemap({key:'map'})
        const tileset = map.addTilesetImage('assetTiles', 'tiles') //grab the tiled tileset file "tileset" from "tiles" image file

        layer1 = map.createStaticLayer('Tile Layer 1', tileset, 0, 0)
        layer2 = map.createStaticLayer('Tile Layer 2', tileset, 0, 0)


        //map.setCollisionByProperty({ collides: true })

        ///player
        player = this.physics.add.sprite(100, 450, 'fox_animation')
        player.body.setSize(80, 160)
        player.body.setOffset(58, 32)
        //player.setBounce(0.2)
        //player.setFrictionX(0.9)
        //player.setMaxVelocity(500, 500)


        //create UI elements
        let ringCenter: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1130, 150)
        actionRing = this.add.sprite(ringCenter.x, ringCenter.y, 'ring')
        jumpIcon = this.add.sprite(ringCenter.x - 100, ringCenter.y, 'jump_icon')
        fireIcon = this.add.sprite(ringCenter.x + 100, ringCenter.y, 'fire_icon_animation')

        //set loop actions
        loopIndex = 0
        loopActions = [action.JUMP, action.FIRE, action.JUMP]
        loopImages = []

        this.initLoopUI() 

        //set player bools
        isJumping = false
        isKnockback = false

        //create projectile group
        projectiles = this.physics.add.group({key: 'projectiles', immovable: true, allowGravity: false})
        projectiles.createMultiple({ classType: Phaser.Physics.Arcade.Sprite, quantity: 5, active: false, visible: false, key: 'fireball_animation' })

        //COLLISIONS

        //player x layer1
        layer1.setCollisionBetween(0,99)
        this.physics.add.collider(player, layer1)

        //fireball x layer1
        this.physics.add.collider(projectiles, layer1)
        
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
        const knockbackVelocity = 1500
        const jumpVelocity = 500

        player.setVelocityX(player.body.velocity.x * 0.9)
        
        //no horizontal movement
        if(!cursors.right?.isDown && !cursors.left?.isDown) {
            //could decide in here to play idle if velocity is 0, or slowdownrun if velocity != 0
            player.setVelocityX(player.body.velocity.x * 0.9)
            player.anims.play('playerStill', true)
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
                knockbackTimer = this.time.delayedCall(400, this.unlockPlayerMovement) //disallow player input for x milliseconds
                isKnockback = true
            }
            loopIndex++
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
            frames: this.anims.generateFrameNumbers('fox_animation', { frames: [0,0,1,1,2,2,2,3,3,4,4,5,5,5] }),
            frameRate: 22,
            repeat: -1
        })
        this.anims.create({
            key: 'playerStill',
            frames: this.anims.generateFrameNumbers('fox_animation', { start: 1, end: 1})
        })

        //projectile animation
        this.anims.create({
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('fireball_animation', { start: 0, end: 5 }),
            frameRate: 10,
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
        if(player.flipX)
            p.setVelocityX(-fireVelocity)
        else
            p.setVelocityX(fireVelocity)
        p.anims.play('shoot', true)
    }

    unlockPlayerMovement() {
        isKnockback = false
    }

    initLoopUI() {
        //dynamically create icons for loop actions
        loopActions.forEach((elem, index) => {
            let x = index*300
            let y = 100
            if(elem == action.JUMP) {
                loopImages.push(this.add.sprite(x, y, 'jump_icon'))
            }
            if(elem == action.FIRE) {
                loopImages.push(this.add.sprite(x, y, 'fire_icon_animation'))
            }
            this.add.text(x, y-100, (index+1).toString(), { fontFamily: 'Georgia', fontSize: '42px'})
            
                //position
                //loopImages[loopImages.length-1].setPosition(index * 300 + 200, 100)
        })
    }
}


