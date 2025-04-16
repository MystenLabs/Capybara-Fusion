
import { GameObjects, Scene } from 'phaser';
import {createSquircle} from "./Squircle";

//TODO probably try to kill this for IconButton [MJ]
export class IconModal extends GameObjects.Container {
    sprite: Phaser.GameObjects.Sprite;
    spriteWidth: number;
    spriteHeight: number;

    onClick?: () => void;

    constructor(scene: Scene, icon: string, xOffsetPct: number, yOffsetPct: number, spriteWidthPct: number, spriteHeightPct: number, onClick?: () => void) {
        const gameWidth = scene.game.canvas.width;
        const gameHeight = scene.game.canvas.height;
        
        super(scene);
        this.addToUpdateList();

        const squircleWidth = gameWidth * .11;
        const squircleHeight = gameWidth * .11;
        const squircleCenterX = gameWidth * xOffsetPct;
        const squircleCenterY = gameHeight * yOffsetPct;
        
        let squircle = createSquircle(scene, squircleCenterX, squircleCenterY, squircleWidth, squircleHeight, 0xffffff, 0.65);
        this.add(squircle);

        const spriteTexture = scene.game.textures.get(icon);
        const texWidth = spriteTexture.source[0].width;
        const texHeight = spriteTexture.source[0].height;

        let spriteSize = Math.min(spriteWidthPct * gameWidth, spriteHeightPct * gameWidth);
        let scalar = texWidth > texHeight ? (spriteSize / texWidth) : (spriteSize / texHeight);

        this.spriteWidth = texWidth * scalar;
        this.spriteHeight = texHeight * scalar;

        this.sprite = new GameObjects.Sprite(scene, gameWidth * xOffsetPct, gameHeight * yOffsetPct, icon);
        this.sprite.setDisplaySize(this.spriteWidth, this.spriteHeight);
        this.add(this.sprite);

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
        
    }

    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        if(this.onClick === undefined) return;
        this.onClick!();
    }
}


