import { GameObjects, Scene } from 'phaser';
import { LoadTextures } from '../Data';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        const gameWidth = this.game.canvas.width;
        const gameHeight = this.game.canvas.height;

        var sprite = new GameObjects.Sprite(this, gameWidth * 0.5, gameWidth * 0.5, 'background');
        sprite.setDisplaySize(gameWidth * 2, gameHeight * 2);
        this.add.existing(sprite);

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(gameWidth * 0.5, gameHeight * 0.5 - 32, gameWidth * 0.8, 64).setStrokeStyle(1, 0xaaaaaa);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(gameWidth * 0.1, gameHeight * 0.5 - 32, 4, 64, 0xeeeeee);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        LoadTextures(this);
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainScene. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainScene');
    }
}
