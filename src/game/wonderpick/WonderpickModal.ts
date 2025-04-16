
import {GameObjects, type Scene} from 'phaser';
import { createBackdrop } from '../ui/Backdrop';
import { IconButton } from '../ui/IconButton';
import { stringHash } from "$lib/utils/Hashes";
import { GameLayer } from '../GameLayer';
import type { MainScene } from '../scenes/MainScene';
import {WonderpickPicker} from "./WonderpickPicker";
import {WonderpickEntry} from "./WonderpickEntry";

export class WonderpickModal extends GameLayer {
    backdrop: GameObjects.NineSlice;
    wonderPicker: WonderpickPicker;
    scene: Scene;

    constructor(scene: MainScene, shown: boolean) {
        const gameWidth = scene.game.canvas.width;
        const gameHeight = scene.game.canvas.height;

        super(scene, shown);
        
        this.scene = scene;
        let backdropWidth = gameWidth * 0.775;
        let backdropHeight = gameHeight;

        let padding = Math.min(backdropWidth, backdropHeight) * 0.15;

        backdropWidth += padding;
        backdropHeight += padding;

        this.backdrop = createBackdrop(scene, gameWidth * 0.5, gameHeight + gameHeight * 0.1, backdropWidth, backdropHeight);
        
        
        this.add(this.backdrop);
        this.wonderPicker = new WonderpickPicker(scene, 'JayDino3');
        this.add(this.wonderPicker);

        this.add(new WonderpickEntry(scene, 'magnify_glass', 'seeds', 'wood_bundle', 0.2, 0.65, 0, 0, 'everlove', 5));
        this.add(new WonderpickEntry(scene, 'motor_boat', 'binoculars', 'wheelbarrow', 0.2, 0.8, 0, 0, 'sortyPlayer', 10));
        this.add(new WonderpickEntry(scene, 'telescope', 'lens', 'tree_small', 0.2, 0.95, 0, 0, 'nuphwo', 10));

        this.add(new IconButton(scene, 'back_icon', 75, 75, 75, () => this.closeModal()));
    }
    
    closeModal(){
        let scene =  this.scene as MainScene;
        scene.hideWonderpickModal();
    }
}


