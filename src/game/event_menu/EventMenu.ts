import { GameObjects, Scene, Textures } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { Ledger } from './Ledger';
import { GameLayer } from '../GameLayer';
import type { MainScene } from '../scenes/MainScene';
import  {EventHeader} from "./EventHeader";

export class EventMenu extends GameLayer {
    backdrop: GameObjects.NineSlice;
    eventHeader: EventHeader;
    ledger: Ledger;

    constructor(scene: MainScene, shown: boolean) {
        super(scene, shown);

        this.add(new IconButton(scene, 'back_icon', 75, 75, 75, () => {
            this.ledger.close();
            scene.hideEventMenu();
        }));
        
        this.eventHeader = new EventHeader(scene);
        this.add(this.eventHeader);
    
        this.ledger = new Ledger(scene);
        this.add(this.ledger);

        this.eventHeader.ledger = this.ledger;
    }
}