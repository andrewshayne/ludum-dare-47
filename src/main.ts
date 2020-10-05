import Phaser from 'phaser'

import TitleScene from './scenes/TitleScene'
import GameScene from './scenes/GameScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	audio: {
		disableWebAudio: true,
		noAudio: false
	},
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: { y: 1600 }
		}
	},
	scene: [TitleScene, GameScene] //looks like it defaults to the first scene in the list
}

export default new Phaser.Game(config)
