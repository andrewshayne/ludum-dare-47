import Phaser from 'phaser'

let titleMusic: Phaser.Sound.BaseSound

export default class TitleScene extends Phaser.Scene
{
	constructor()
	{
		super('title-scene')
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

        this.add.text(1280/2, 720 * 0.4, 'Mage Game', { fontFamily: 'Georgia', fontSize: '72px', align: 'center'}).setOrigin(0.5)
        this.add.text(1280/2, 720 * 0.55, 'Press F to pay repsects.', { fontFamily: 'Georgia', fontSize: '32px', align: 'center'}).setOrigin(0.5)

        titleMusic = this.sound.add('menumusic', { volume: 0.4, loop: true })
    }

    update()
    {
        if(Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE))) {
            titleMusic.stop()
            this.scene.start('tilemap-scene')
        }
    }
}

