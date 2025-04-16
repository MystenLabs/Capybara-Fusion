import { GameObjects, Scene, Textures } from 'phaser';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';
import { createBackdrop } from '../ui/Backdrop';
import { IconButton } from '../ui/IconButton';
import { LedgerItem } from './LedgerItem';
import type { Toolbar } from '../ui/Toolbar';
import { generateCapy, generateItem, type BlockchainCapy, type BlockchainItem } from '../GenerateBlockchainData';
import { TextButton } from '../ui/TextButton';
import type { ItemDataDictionary } from '../merge/Data';
import { stringHash } from '$lib/utils/Hashes';
import TimerEvent = Phaser.Time.TimerEvent;
import type {MainScene} from "../scenes/MainScene";
import type { Ledger } from './Ledger';
import { SpriteFocusModal } from '../ui/SpriteFocusModal';

export class EventHeader extends GameObjects.Container {
    backdrop: GameObjects.NineSlice;
    mover: GameObjects.Container;

    uiWidth: number;
    uiHeight: number;
    
    itemTextLeft: GameObjects.Text;
    itemLeftCount: number;
    itemLeftTotal: number;
    itemTextRight: GameObjects.Text;
    itemRightCount: number;
    itemRightTotal: number;
    timer: TimerEvent;
    timerText: TextButton;
    updateTimer: boolean;

    ledger: Ledger;
    
    constructor(scene: Scene) {
        let x = scene.game.canvas.width * 0.5;
        let y = scene.game.canvas.height * 0.325;

        super(scene, x, y);
        this.addToUpdateList();

        this.updateTimer = true;

        let gameWidth = scene.game.canvas.width;
        let gameHeight = scene.game.canvas.height;

        this.uiWidth = gameWidth * 0.9;
        this.uiHeight = gameHeight * 0.45;

        this.backdrop = createBackdrop(scene, 0, 0, this.uiWidth, this.uiHeight);
        this.add(this.backdrop);

        this.mover = new GameObjects.Container(scene, 0, 0);
        this.add(this.mover);

        //TODO actually have multiple festivals [MJ]
        let text = new GameObjects.Text(scene, 0, -gameHeight * 0.15, "Stargazing Festival", { fontSize: '40px', fontFamily: "Quantico", color: "#000" });
        text.setOrigin(0.5);
        this.add(text);
        this.itemLeftCount = 23;
        this.itemLeftTotal = 24;
        this.itemRightCount = 40;
        this.itemRightTotal = 40;
        
        let arrowHeight = -gameHeight * 0.15;
        let leftButton = new IconButton(scene, 'left_icon', -gameWidth * 0.3, arrowHeight, 75, () => {});
        this.add(leftButton);
        
        let rightButton = new IconButton(scene, 'right_icon', gameWidth * 0.3, arrowHeight, 75, () => {});
        this.add(rightButton);
        

        let itemBoxHeight = -gameHeight * 0.025;
        let itemOneBoxIcon = new IconButton(scene, 'box_item_banner', -gameWidth * 0.15, itemBoxHeight, 200, () => this.donateLeftItem());
        this.add(itemOneBoxIcon);
        let itemTwoBoxIcon = new IconButton(scene, 'box_item_banner', gameWidth * 0.15, itemBoxHeight, 200, () => {});
        this.add(itemTwoBoxIcon);
        let itemHeight = -gameHeight * 0.03;
        let itemOneIcon = new IconButton(scene, 'high_tech_telescope_item', -gameWidth * 0.15, itemHeight, 100, () => this.donateLeftItem());
        this.add(itemOneIcon);
        let itemTwoIcon = new IconButton(scene, 'pennant', gameWidth * 0.15, itemHeight, 100, () => {});
        this.add(itemTwoIcon);

        let itemTextHeight = gameHeight * 0.03;
        let itemTextWidth = gameWidth * 0.145;
        this.itemTextLeft = new GameObjects.Text(scene, -itemTextWidth, itemTextHeight, `${this.itemLeftCount}/${this.itemLeftTotal}`, { fontSize: '20px', fontFamily: "Quantico", color: "#000" });
        this.itemTextLeft.setOrigin(0.5);
        this.add(this.itemTextLeft);
        this.itemTextRight = new GameObjects.Text(scene, itemTextWidth, itemTextHeight, `${this.itemRightCount}/${this.itemRightTotal}`, { fontSize: '20px', fontFamily: "Quantico", color: "#000" });
        this.itemTextRight.setOrigin(0.5);
        this.add(this.itemTextRight);

        this.timerText = new TextButton(scene, this.formatTime(this.scene.game.registry.get('timeRemaining')), "40px", 0, gameHeight * 0.15, gameWidth * 0.6, () => {});
        this.add(this.timerText);
        this.timer = this.scene.time.addEvent({
            delay: 1000, // ms
            callback: ()=>this.updateTimerText(),
            loop: true,
        });
        
        this.scene.events.on('destroy', ()=>this.cleanup());
        
    }
    
    cleanup(){
        this.timer.destroy();
    }
    
    updateTimerText() {
        this.timerText.updateText(this.formatTime(this.scene.game.registry.get('timeRemaining')));
    }

    donateLeftItem(){
        if(this.itemLeftCount >= this.itemLeftTotal) return;
        let mainScene = this.scene as MainScene;
        const item = mainScene.mergeModalLayer.findItem(stringHash('high_tech_telescope'));

        if(item === null) {
            return;
        }

        new SpriteFocusModal(mainScene, mainScene.eventMenuLayer, 'high_tech_telescope_item', this.scene.game.canvas.width * 0.6, "DONATE", () => {
            this.ledger.uploadItem(generateItem(item.name, 'capyguy22', 'CapyHQ', 'DONATE'));
            mainScene.mergeModalLayer.board.removeItem(item);
            this.itemLeftCount++;
            this.itemTextLeft.text = `${this.itemLeftCount}/${this.itemLeftTotal}`;
            this.updateTimer = false;
        });
    }

    formatTime(milliseconds: number) {
        if (!this.updateTimer) {
            return 'Completed';
        }

        let seconds = milliseconds / 1000;
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        minutes = minutes - hours * 60;
        const secs = seconds % 60;
        return `Ends in: ${hours}:${minutes}:${secs.toString().padStart(2, "0")}`;
    }
    
    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {

    }
}