
import { GameObjects, Scene } from 'phaser';
import {createSquircle} from "../ui/Squircle";
import {BoxedItem} from "../ui/BoxedItem";
import type { ItemData, ItemDataDictionary } from '../merge/Data';
import { stringHash } from '$lib/utils/Hashes';
import type { MainScene } from '../scenes/MainScene';

export class WonderpickEntry extends GameObjects.Container {
    item1: ItemData;
    item2: ItemData;
    item3: ItemData;
    userName: string;

    sprite: Phaser.GameObjects.Sprite;
    onClick?: () => void;

    constructor(scene: Scene, item1_id: string, item2_id: string, item3_id: string, xOffsetPct: number, yOffsetPct: number, spriteWidthPct: number, spriteHeightPct: number, userName:string, tradeAmount:number, onClick?: () => void) {
        const items : ItemDataDictionary = scene.registry.get('items');
        
        const gameWidth = scene.game.canvas.width;
        const gameHeight = scene.game.canvas.height;
        
        let xPos = gameWidth * xOffsetPct;
        let yPos = gameHeight * yOffsetPct;

        super(scene, xPos, yPos);
        this.addToUpdateList();

        this.item1 = items[stringHash(item1_id)];
        this.item2 = items[stringHash(item2_id)];
        this.item3 = items[stringHash(item3_id)];

        const squircleWidth = gameWidth * .75;
        const squircleHeight = gameWidth * .245;
        const squircleCenterX = gameWidth * 0.3;
        const squircleCenterY = gameHeight * 0.018;

        let squircle = createSquircle(scene, squircleCenterX, squircleCenterY, squircleWidth, squircleHeight, 0xffffff, 0.65);
        this.add(squircle);
        
        let boxedItem1 = new BoxedItem(scene, this.item1.icon, gameWidth * 0, 0, 100, 100);
        this.add(boxedItem1);
        let boxedItem2 = new BoxedItem(scene, this.item2.icon, gameWidth * 0.3, 0, 100, 100);
        this.add(boxedItem2);
        let boxedItem3 = new BoxedItem(scene, this.item3.icon, gameWidth * 0.6, 0, 100, 100);
        this.add(boxedItem3);

        let text = new GameObjects.Text(scene, squircleCenterX, gameHeight * 0.05, `${userName} TRADE PICK for ↯${tradeAmount}`, { fontSize: '25px', fontFamily: "Quantico", color: "#000" });
        text.setOrigin(0.5, 0.0);
        this.add(text);

        if(onClick === undefined) return;
        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(squircleCenterX-squircleWidth * 0.5, squircleCenterY-squircleHeight * 0.5, squircleWidth, squircleHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: true,
        }
        this.setInteractive(hitArea);
        this.onClick = onClick;
        this.on('pointerdown', this.pointerDown);

        this.userName = userName;
    }

    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        const items : ItemDataDictionary = this.scene.registry.get('items');
        (<MainScene>this.scene).wonderpickModalLayer.wonderPicker.resetCards([this.item1, this.item2, this.item3], this.userName);
    }
}


