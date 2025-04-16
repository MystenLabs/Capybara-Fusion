import { Boot } from './scenes/Boot';
import { MainScene } from './scenes/MainScene';
import { WEBGL, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { LoadMergeData } from './merge/Data';
import { LoadShopData } from './shop/Data';
import { LoadLocations, LoadCapyData } from './overworld/Data';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
let config: Phaser.Types.Core.GameConfig = {
    type: WEBGL,
    parent: 'game-container',
    backgroundColor: '#110022',
    scene: [
        Boot,
        Preloader,
        MainScene
    ],
    render: {
        pixelArt: false,
        roundPixels: false,
        antialias: true,
        antialiasGL: true,
        mipmapFilter: 'LINEAR_MIPMAP_LINEAR'
    },
    antialias: true,
    antialiasGL: true,
    mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
};

const StartGame = (parent: string) => {
    config.height = 1365;
    config.width = 768;

    if (window.innerHeight / window.innerWidth > 1.778) {
        config.height = Math.round(768 * window.innerHeight / window.innerWidth);
    }

    const game: Phaser.Game = new Game({ ...config, parent });

    LoadMergeData(game);
    LoadShopData(game);
    LoadLocations(game);
    LoadCapyData(game);

    return game;
}

export default StartGame;
