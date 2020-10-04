import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'
import TileMapScene from './scenes/TileMapScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	audio: {
		disableWebAudio: true,
		noAudio: false
	}
	physics: {
		default: 'arcade',
		arcade: {
			debug: true,
			gravity: { y: 1600 }
		}
	},
	scene: [TileMapScene, HelloWorldScene] //looks like it defaults to the first scene in the list
}

export default new Phaser.Game(config)
