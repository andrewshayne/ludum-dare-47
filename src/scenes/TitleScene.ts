import Phaser from 'phaser'

let titleMusic: Phaser.Sound.BaseSound
let COMPLETED_GAME: integer

export default class TitleScene extends Phaser.Scene
{
	constructor()
	{
		super('title-scene')
    }
    
    init(data)
    {
        COMPLETED_GAME = data.COMPLETED_GAME
    }

	preload()
    {
        this.load.audio('menumusic', 'music/menu.wav')
    }

    create()
    {
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

        if(COMPLETED_GAME) {
            this.add.text(1280/2, 720 * 0.33, 'Thanks for playing!', { fontFamily: 'Georgia', fontSize: '60px', align: 'center' }).setOrigin(0.5)
        }
        this.add.text(1280/2, 720 * 0.44, 'Mage Game', { fontFamily: 'Georgia', fontSize: '72px', align: 'center'}).setOrigin(0.5)
        this.add.text(1280/2, 720 * 0.55, 'Press space to play.', { fontFamily: 'Georgia', fontSize: '30px', align: 'center'}).setOrigin(0.5)

        titleMusic = this.sound.add('menumusic', { volume: 0.4, loop: true })

    }

    update()
    {
        if(Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))) {
            titleMusic.stop()
            this.scene.start('game-scene', { STAGE_LEVEL: 1})
        }
    }
}

