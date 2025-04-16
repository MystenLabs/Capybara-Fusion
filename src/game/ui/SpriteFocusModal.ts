import { GameObjects, Scene, Textures } from 'phaser';
import { createBackdrop } from '../ui/Backdrop';
import { IconButton } from '../ui/IconButton';
import { GameLayer } from '../GameLayer';
import type { MainScene } from '../scenes/MainScene';
import { TextButton } from './TextButton';

export class SpriteFocusModal extends GameLayer {
    backdrop: GameObjects.NineSlice;
    spawningLayer: GameLayer;
    sprite: GameObjects.Sprite;

    callback: () => void;
    cleanupCallback?: () => void;

    spriteWidth: number;
    spriteHeight: number;

    constructor(scene: MainScene, spawningLayer: GameLayer, sprite: string, spriteSize: number, buttonText: string, onClick: () => void, cleanupCallback?: ()=>void) {
        const gameWidth = scene.game.canvas.width;
        const gameHeight = scene.game.canvas.height;

        super(scene, false);

        this.callback = onClick;
        this.cleanupCallback = cleanupCallback;

        const backdropWidth = gameWidth * 0.9;
        const backdropHeight = gameWidth * 0.75;

        this.backdrop = createBackdrop(scene, gameWidth * 0.5, gameHeight * 0.5, backdropWidth, backdropHeight);
        this.add(this.backdrop);

        const spriteTexture = scene.game.textures.get(sprite);
        const texWidth = spriteTexture.source[0].width;
        const texHeight = spriteTexture.source[0].height;

        let scalar = texWidth > texHeight ? (spriteSize / texWidth) : (spriteSize / texHeight);

        this.spriteWidth = texWidth * scalar;
        this.spriteHeight = texHeight * scalar;

        const spriteY = gameHeight * 0.5 - backdropHeight * 0.333;
        this.sprite = new GameObjects.Sprite(scene, gameWidth * 0.5, spriteY, spriteTexture);
        this.sprite.setDisplaySize(this.spriteWidth, this.spriteHeight);
        this.add(this.sprite);

        this.spawningLayer = spawningLayer;

        const textButtonY = gameHeight * 0.5 + backdropHeight * 0.25;
        this.add(new TextButton(scene, buttonText, "40px", gameWidth * 0.5, textButtonY, gameWidth * 0.6, () => this.onClick()));

        this.add(new IconButton(scene, 'back_icon', 75, 75, 75, () => this.closeModal()));

        spawningLayer.blur(0.333);
        scene.toolBarLayer.blur(0.333);
        this.show(0.333);

        scene.addLayer(this, false);
        this.initLayer();
        scene.updateLayers();
    }

    onClick() {
        this.closeModal();
        this.callback();
    }

    closeModal() {
        this.spawningLayer.focus(0.333);
        this.mainScene.toolBarLayer.focus(0.333);
        this.hide(0.333);
        this.scene.time.delayedCall(400, () => this.mainScene.destroyLayer(this), [], this);
        if(this.cleanupCallback === null || this.cleanupCallback === undefined) return;
        this.cleanupCallback();
    }
}