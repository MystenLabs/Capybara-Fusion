import { GameObjects, Scene, Textures } from 'phaser';
import { createBackdrop } from '../ui/Backdrop';
import { IconButton } from '../ui/IconButton';
import { GameLayer } from '../GameLayer';
import type { MainScene } from '../scenes/MainScene';
import { TextButton } from '../ui/TextButton';
import type { ItemChainDictionary, ItemDataDictionary, ItemID } from './Data';

const itemPositions = [
    new Phaser.Math.Vector2(0.28, 0.09),
    new Phaser.Math.Vector2(0.70, 0.17),
    new Phaser.Math.Vector2(0.73, 0.45),
    new Phaser.Math.Vector2(0.30, 0.50),
    new Phaser.Math.Vector2(0.25, 0.72),
    new Phaser.Math.Vector2(0.72, 0.80),
];

export class InfoModal extends GameLayer {
    chainBackdrop: GameObjects.NineSlice;
    selectedBackdrop: GameObjects.NineSlice;

    spawningLayer: GameLayer;
    sprite: GameObjects.Sprite;

    spriteWidth: number;
    spriteHeight: number;

    constructor(scene: MainScene, spawningLayer: GameLayer, itemID: ItemID) {
        const gameWidth = scene.game.canvas.width;
        const gameHeight = scene.game.canvas.height;

        super(scene, false);

        const items : ItemDataDictionary = scene.registry.get('items');
        const item = items[itemID];

        const width = gameWidth * 0.8;

        let x = gameWidth * 0.5;
        let y = gameHeight;

        this.chainBackdrop = createBackdrop(scene, x, y, width, gameHeight);
        this.add(this.chainBackdrop);

        let chainSize = gameWidth * 0.9;

        y = gameHeight - chainSize * 0.5;

        const chainBackground = new GameObjects.Sprite(scene, x, y, "chain_background");
        chainBackground.setDisplaySize(chainSize, chainSize);
        this.add(chainBackground);

        x = gameWidth * (1 - 0.9) * 0.5;
        y = gameHeight;

        const chains: ItemChainDictionary = scene.registry.get('chains');
        const chain = chains[item.chain || 0];
        const itemSize = width * 0.275;

        let chainIndex = 0;
        for (const chainItem of chain) {
            const baseTexture = this.scene.game.textures.get(chainItem.icon);

            const texWidth = baseTexture.source[0].width;
            const texHeight = baseTexture.source[0].height;

            let scalar = texWidth > texHeight ? (itemSize / texWidth) : (itemSize / texHeight);

            let sprite = new GameObjects.Sprite(
                this.scene,
                x + (chainSize * itemPositions[chainIndex].x),
                y - (chainSize * itemPositions[chainIndex].y),
                chainItem.icon
            );
            sprite.setDisplaySize(texWidth * scalar, texHeight * scalar);
            this.add(sprite);

            chainIndex++;
        }

        y = scene.game.canvas.height * 0.275;


        this.selectedBackdrop = createBackdrop(scene, gameWidth * 0.5, y, width, width * 0.85);
        this.add(this.selectedBackdrop);

        let bannerTexture = this.scene.game.textures.get('box_item_banner');

        let bannerWidth = bannerTexture.source[0].width;
        let bannerHeight = bannerTexture.source[0].height;
        let bannerSize = itemSize * 2.2;

        let scalar = bannerWidth > bannerHeight ? (bannerSize / bannerWidth) : (bannerSize / bannerHeight);

        let bannerSprite = new GameObjects.Sprite(this.scene, gameWidth * 0.5, y, 'box_item_banner');
        bannerSprite.setDisplaySize(bannerWidth * scalar, bannerHeight * scalar);
        this.add(bannerSprite);


        let baseTexture = this.scene.game.textures.get(item.icon);

        let texWidth = baseTexture.source[0].width;
        let texHeight = baseTexture.source[0].height;

        scalar = texWidth > texHeight ? (itemSize * 1.75 / texWidth) : (itemSize * 1.75 / texHeight);

        let sprite = new GameObjects.Sprite(
            this.scene,
            gameWidth * 0.5,
            y,
            item.icon
        );
        sprite.setDisplaySize(texWidth * scalar, texHeight * scalar);
        this.add(sprite);


        this.spawningLayer = spawningLayer;
        this.add(new IconButton(scene, 'back_icon', 75, 75, 75, () => this.closeModal()));

        spawningLayer.blur(0.333);
        scene.toolBarLayer.blur(0.333);
        this.show(0.333);

        scene.addLayer(this, false);
        this.initLayer();
        scene.updateLayers();
    }

    closeModal() {
        this.spawningLayer.focus(0.333);
        this.mainScene.toolBarLayer.focus(0.333);
        this.hide(0.333);
        this.scene.time.delayedCall(400, () => this.mainScene.destroyLayer(this), [], this);
    }
}