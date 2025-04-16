import { GameObjects, Scene, Textures } from 'phaser';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';

export class TextButton extends GameObjects.Container {
    sprite: GameObjects.Sprite;
    text: GameObjects.Text;
    
    iconWidth: number;
    iconHeight: number;

    onClick?: () => void;

    pressingDown: boolean

    constructor(scene: Scene, text: string, fontSize: string, x: number, y: number, size: number, onClick?: () => void) {
        super(scene, x, y);
        this.addToUpdateList();

        const baseTexture = scene.game.textures.get('text_button_box');
        const texWidth = baseTexture.source[0].width;
        const texHeight = baseTexture.source[0].height;

        let scalar = texWidth > texHeight ? (size / texWidth) : (size / texHeight);

        this.iconWidth = texWidth * scalar;
        this.iconHeight = texHeight * scalar;

        this.sprite = new GameObjects.Sprite(scene, 0, 0, 'text_button_box');
        this.sprite.setDisplaySize(this.iconWidth, this.iconHeight);
        this.add(this.sprite);

        this.text = new GameObjects.Text(scene, 0, 0, text, { fontSize: fontSize, fontFamily: "Quantico", color: "#000" });
        this.text.setOrigin(0.5);
        this.add(this.text);

        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-this.iconWidth * 0.5, -this.iconHeight * 0.5, this.iconWidth, this.iconHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: true,
        }
        this.setInteractive(hitArea);

        this.on('pointerdown', this.pointerDown);
        this.on('pointerup', this.pointerUp);

        this.onClick = onClick;
        this.pressingDown = false;
    }

    updateText(newText: string){
        this.text.text = newText;
    }
    
    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        this.pressingDown = true;
    }

    pointerOut(pointer: Phaser.Input.Pointer, e: Phaser.Types.Input.EventData) {
        this.pressingDown = false;
    }

    pointerUp(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        if (this.pressingDown && this.onClick !== undefined) {
            this.onClick();
        }
        this.pressingDown = false;
    }

    preUpdate(time: number, delta: number) {
        //const dt = delta / 1000;
    }
}