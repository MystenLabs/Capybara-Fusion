import { GameObjects, Scene } from 'phaser';
import { MergeItemType, QuestBoxType } from '../GameObjectTypes';
import { type Level, type ItemDataDictionary, type ItemData, CalculateRecipeId, type QuestData, type ItemID, type QuestID } from './Data';
import type { MainScene } from '../scenes/MainScene';
import { InfoModal } from './InfoModal';

export class ItemRequirement extends GameObjects.Container {
    itemSprite: GameObjects.Sprite;
    countText: GameObjects.Text;

    totalItems: number;
    iconSize: number;

    quest: QuestData;
    itemID: ItemID;

    constructor(scene: Scene, x: number, y: number, width: number, height: number, quest: QuestData, itemID: ItemID) {
        super(scene, x, y);

        this.itemID = itemID;
        const items : ItemDataDictionary = scene.registry.get('items');
        const item = items[itemID];

        this.totalItems = quest.requirements[itemID];
        this.iconSize = width * 0.5;

        let countX = (-width * 0.5) + (width * 0.75);
        this.countText = new GameObjects.Text(scene, countX, 0, `0/${this.totalItems}`, { fontSize: "25px", fontFamily: "Quantico", color: "#000", fixedWidth: width * 0.333, maxLines: 1 });
        this.countText.setOrigin(0.5, 0.5);
        this.add(this.countText);

        this.itemSprite = this.createSprite((-width * 0.5) + (width * 0.25), item.icon);
        this.add(this.itemSprite);

        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-this.width * 0.5, -this.iconSize * 0.5, this.iconSize, this.iconSize),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: true,
        }
        this.setInteractive(hitArea);

        this.on('pointerdown', this.pointerDown);

        this.type = QuestBoxType;
    }

    createSprite(x: number, texture: string) {
        const baseTexture = this.scene.game.textures.get(texture);
        const texWidth = baseTexture.source[0].width;
        const texHeight = baseTexture.source[0].height;
        let scalar = texWidth > texHeight ? (this.iconSize / texWidth) : (this.iconSize / texHeight);

        let sprite = new GameObjects.Sprite(this.scene, x, 0, texture);
        sprite.setDisplaySize(texWidth * scalar, texHeight * scalar);

        return sprite;
    }

    updateCount(itemCount: number) {
        this.countText.text = `${itemCount}/${this.totalItems}`;
    }

    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        let mainScene = <MainScene>this.scene;
        new InfoModal(mainScene, mainScene.mergeModalLayer, this.itemID);
    }
}