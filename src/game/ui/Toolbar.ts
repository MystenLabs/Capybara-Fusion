import { GameObjects, Scene, Textures } from 'phaser';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';
import { createBackdrop } from './Backdrop';
import { IconButton } from './IconButton';
import { EventMenu } from '../event_menu/EventMenu';
import type { Map } from '../overworld/Map';
import { MergeModal } from '../merge/MergeModal';
import type { MainScene } from '../scenes/MainScene';
import { SpriteFocusModal } from './SpriteFocusModal';

export class Toolbar extends GameObjects.Container {
    mainScene: MainScene;
    backdrop: GameObjects.NineSlice;

    toolbarWidth: number;
    peek: number
    xPadding: number;
    yPadding: number;
    iconSize: number;

    buttonY: number;
    playButtonX: number;

    visibleY: number;
    hiddenY: number;
    targetY: number;

    yDynamics: SecondOrderDynamics;
    shown: boolean;

    constructor(scene: MainScene, peek: number, width: number, iconSize: number, xPadding: number, yPadding: number) {
        let x = scene.game.canvas.width * 0.5;
        let y = scene.game.canvas.height + width * 0.5 - peek;

        super(scene, x, y);
        this.addToUpdateList();

        this.mainScene = scene;

        this.visibleY = y;
        this.hiddenY = scene.game.canvas.height + width * 0.65;

        this.backdrop = createBackdrop(scene, 0, 0, width, width);
        this.add(this.backdrop);

        let spacing = (width - (xPadding * 2)) * 0.2;
        let buttonY = -width * 0.5 + yPadding + iconSize * 0.5;

        let buttonX = -width * 0.5 + xPadding + spacing;

        this.add(new IconButton(scene, 'book_icon', buttonX, buttonY, iconSize, () => scene.showEventMenu()))

        buttonX += spacing;

        this.playButtonX = buttonX;
        this.add(new IconButton(scene, 'play_icon', buttonX, buttonY, iconSize, () => scene.showMergeModal()))

        buttonX += spacing;

        this.add(new IconButton(scene, 'trade_icon', buttonX, buttonY, iconSize, () => scene.showWonderpickModal()))

        buttonX += spacing;

        this.add(new IconButton(scene, 'gear_icon', buttonX, buttonY, iconSize, () => this.testSpriteFocusModal()))

        this.toolbarWidth = width;
        this.peek = peek;
        this.xPadding = xPadding;
        this.yPadding = yPadding;
        this.iconSize = iconSize;

        this.buttonY = buttonY;

        this.yDynamics = new SecondOrderDynamics(2.75, 1, 0, this.y);
        this.targetY = this.visibleY;
        this.shown = true;
    }

    showBar() {
        this.targetY = this.visibleY;
        this.shown = true;
    }

    hideBar() {
        this.targetY = this.hiddenY;
        this.shown = false;
    }

    preUpdate(time: number, delta: number) {
        const dt = delta / 1000;
        this.y = this.yDynamics.update(this.targetY, dt);
    }

    testSpriteFocusModal() {
        let spriteWidth = this.scene.game.canvas.width * 0.1;
        new SpriteFocusModal(this.mainScene, this.mainScene.mapLayer, 'gear_icon', spriteWidth, "RESET GAME", () => {location.reload()});
    }

    getPlayButtonPosition(): {x: number, y: number} {
        return { x: this.x + this.playButtonX, y: this.y + this.buttonY };
    }
}