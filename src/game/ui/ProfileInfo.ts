import { GameObjects, Scene, Textures } from 'phaser';
import { createBackdrop } from '../ui/Backdrop';
import { IconButton } from '../ui/IconButton';
import { GameLayer } from '../GameLayer';
import type { MainScene } from '../scenes/MainScene';
import { TextButton } from './TextButton';
import { createSquircle } from './Squircle';

export class ProfileInfo extends GameLayer {
    backdrop: GameObjects.NineSlice;
    spawningLayer: GameLayer;
    sprite: GameObjects.Sprite;

    spriteWidth: number;
    spriteHeight: number;

    constructor(scene: MainScene, spawningLayer: GameLayer) {
        const gameWidth = scene.game.canvas.width;
        const gameHeight = scene.game.canvas.height;

        super(scene, false);

        const backdropWidth = gameWidth * 0.9;
        const backdropHeight = gameWidth * 0.75;

        this.backdrop = createBackdrop(scene, gameWidth * 0.5, gameHeight * 0.5, backdropWidth, backdropHeight);
        this.add(this.backdrop);

        const spriteTexture = scene.game.textures.get("user");
        const texWidth = spriteTexture.source[0].width;
        const texHeight = spriteTexture.source[0].height;

        let scalar = texWidth > texHeight ? (backdropWidth * 0.2 / texWidth) : (backdropWidth * 0.2 / texHeight);

        this.spriteWidth = texWidth * scalar;
        this.spriteHeight = texHeight * scalar;

        const spriteY = gameHeight * 0.5 - backdropHeight * 0.3;
        this.sprite = new GameObjects.Sprite(scene, gameWidth * 0.5, spriteY, spriteTexture);
        this.sprite.setDisplaySize(this.spriteWidth, this.spriteHeight);
        this.add(this.sprite);

        this.spawningLayer = spawningLayer;

        const userNameTextY = gameHeight * 0.5 - backdropHeight * 0.1;
        let userNameText = new GameObjects.Text(scene, gameWidth * 0.5, userNameTextY, "Welcome Back capyguy22!", { fontSize: "40px", fontFamily: "Quantico", color: "#000" });
        userNameText.setOrigin(0.5);
        this.add(userNameText);

        const walletTextY = gameHeight * 0.5 + backdropHeight * 0.1;

        const walletBackdrop = createSquircle(scene, gameWidth * 0.5, walletTextY, backdropWidth * 0.8, 60, 0xFFFFFF, 0.75);
        this.add(walletBackdrop);
        
        let walletText = new GameObjects.Text(scene, gameWidth * 0.5, walletTextY, "> My Wallet", { fontSize: "40px", fontFamily: "Quantico", color: "#000" });
        walletText.setOrigin(0.5);
        this.add(walletText);

        const textButtonY = gameHeight * 0.5 + backdropHeight * 0.35;
        this.add(new TextButton(scene, "LOGOUT", "40px", gameWidth * 0.5, textButtonY, gameWidth * 0.6, () => this.closeModal()));

        this.add(new IconButton(scene, 'back_icon', 75, 75, 75, () => this.closeModal()));

        scene.mapLayer.blur(0.333);
        spawningLayer.blur(0.333);
        this.show(0.333);

        scene.addLayer(this, false);
        this.initLayer();
        scene.updateLayers();
    }

    closeModal() {
        (<MainScene>this.scene).mapLayer.focus(0.333);
        this.spawningLayer.focus(0.333);
        this.hide(0.333);
        this.scene.time.delayedCall(400, () => this.mainScene.destroyLayer(this), [], this);
    }
}