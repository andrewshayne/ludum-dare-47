import Phaser, { GameObjects } from 'phaser'

let player: Phaser.Physics.Arcade.Sprite

export default class TileMapScene extends Phaser.Scene
{
	constructor()
	{
		super('tilemap-scene')
	}

	preload()
    {
        this.load.image('tiles', 'assets/assetTiles.png')
        this.load.tilemapTiledJSON('map', 'assets/assetTiles.json')
        this.load.spritesheet('fox_animation', 'assets/foxrun.png', { frameWidth: 110, frameHeight: 128 })
    }

    create()
    {
        const map = this.make.tilemap({key:'map'})
        const tileset = map.addTilesetImage('tileset', 'tiles') //grab the tiled tileset file "tileset" from "tiles" image file

        const layer1 = map.createStaticLayer('Tile Layer 1', tileset, 0, 0)
        const layer2 = map.createStaticLayer('Tile Layer 2', tileset, 0, 0)
        const layer3 = map.createStaticLayer('Tile Layer 3', tileset, 0, 0)

        ///
        player = this.physics.add.sprite(100, 450, 'fox_animation')
        player.setBounce(0.2)
        player.setCollideWorldBounds(true) //collide with world bounds

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('fox_animation', { start: 0, end: 6 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'still',
            frames: this.anims.generateFrameNumbers('fox_animation', { start: 2, end: 2})
        })
        ///

    }

    update(time, delta)
    {

        const cursors = this.input.keyboard.createCursorKeys()
        const runVelocity = 150
        if(cursors.right?.isDown) {
            player.setVelocityX(runVelocity)
            player.flipX = false;
            player.anims.play('right', true)
        }
        else if(cursors.left?.isDown) {
            player.setVelocityX(-runVelocity)
            player.flipX = true;
            player.anims.play('right', true)
        }
        else {
            player.setVelocityX(0)
            player.anims.play('still', true)
        }


    }
}


