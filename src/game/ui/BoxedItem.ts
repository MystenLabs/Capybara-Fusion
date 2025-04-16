import { GameObjects, Scene, Textures } from 'phaser';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';
import {IconButton} from "./IconButton";

export class BoxedItem extends GameObjects.Container {
    sprite: GameObjects.Sprite;

    iconWidth: number;
    iconHeight: number;

    onClick?: () => void;

    pressingDown: boolean

    constructor(scene: Scene, icon: string, x: number, y: number, boxSize: number, itemSize: number, onClick?: () => void) {
        super(scene, x, y);


        let gameWidth = scene.game.canvas.width;
        let gameHeight = scene.game.canvas.height;
        
        let itemOneBoxIcon = new IconButton(scene, 'box_item_banner', 0, 0, boxSize, onClick);
        this.add(itemOneBoxIcon);
        let itemTwoBoxIcon = new IconButton(scene, 'box_item_banner', 0, 0, boxSize, () => {});
        this.add(itemTwoBoxIcon);
        let itemOneIcon = new IconButton(scene, icon, 0, 0, itemSize);
        this.add(itemOneIcon);
    }
}