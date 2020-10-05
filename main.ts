import Phaser from 'phaser'

import TitleScene from './src/TitleScene' //'./scenes/TitleScene'
import GameScene from './src/GameScene' //'./scenes/GameScene'

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
			debug: true,
			gravity: { y: 1600 }
		}
	},
	scene: [TitleScene, GameScene]
}

export default new Phaser.Game(config)
