import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'
import TileMapScene from './scenes/TileMapScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [TileMapScene, HelloWorldScene] //looks like it defaults to the first scene in the list
}

export default new Phaser.Game(config)
