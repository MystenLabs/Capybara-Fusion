import { GameObjects, Scene, Textures } from 'phaser';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';
import type { Location } from './Data';
import type { Map } from './Map';
import {SpriteFocusModal} from "../ui/SpriteFocusModal";
import type {MainScene} from "../scenes/MainScene";
import {IconModal} from "../ui/IconModal";
import {CapyAssignmentModal} from "./CapyAssignmentModal";
import {Capy} from "./Capy";

export class MapLocation extends GameObjects.Container {
    map: Map
    sprite: GameObjects.Sprite;
    
    locationWidth: number;
    locationHeight: number;

    location: Location;
    
    upgradeModal: IconModal;
    playModal: IconModal;
    
    canBeUpgraded: boolean;

    constructor(scene: Scene, map: Map, location: Location, mapWidth: number, mapHeight: number) {
        const x = mapWidth * (location.position.x - 0.5);
        const y = mapHeight * (location.position.y - 0.5);

        super(scene, x, y);
        this.addToUpdateList();
        

        this.location = location;
        this.map = map;

        this.canBeUpgraded = false;

        this.locationWidth = mapWidth * location.scale.x;
        this.locationHeight = mapHeight * location.scale.y;

        this.sprite = new GameObjects.Sprite(scene, 0, 0, location.texture);
        this.sprite.setDisplaySize(this.locationWidth, this.locationHeight);
        this.add(this.sprite);

        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-this.locationWidth * 0.5, -this.locationHeight * 0.5, this.locationWidth, this.locationHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: false,
        }
        this.setInteractive(hitArea);

        this.on('pointerdown', this.pointerDown);
    }

    markForUpgrading() {
        this.playModal.destroy();
        this.upgradeModal = new IconModal(this.scene, 'exclamation_icon', 0.2, -0.075, 0.1, 0.1, () => this.attemptUpgrade());
        this.add(this.upgradeModal);
        this.canBeUpgraded = true;
    }

    markAsCurrent() {
        this.playModal = new IconModal(this.scene, 'current_location_icon', 0.2, -0.075, 0.1, 0.1, () => (<MainScene>this.scene).showMergeModal());
        this.add(this.playModal);
    }
    
    attemptUpgrade() {
        //TODO this is a super quick and dirty solution to stop downgrading, make this not bad [MJ]
        if(this.location.upgrade === -1) return;
        //TODO maybe just only register this after marking for upgrading [MJ]
        if(!this.canBeUpgraded) return;
        //TODO can we guarantee this is a MainScene? [MJ]
        let scene = this.scene as MainScene;
        let spriteWidth = this.scene.game.canvas.width * 0.6;
        let upgradeLocationInfo = this.map.getLocationInfo(this.location.upgrade);
        scene.hideToolBar();
        let testLayer = new SpriteFocusModal(scene, scene.mapLayer, upgradeLocationInfo.texture, spriteWidth, "UPGRADE", () => this.upgrade(), () => scene.showToolBar());
    }
    
    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        this.attemptUpgrade();
    }

    preUpdate(time: number, delta: number) {
        const dt = delta / 1000;
    }

    upgrade() {
        //TODO this is a super quick and dirty solution to stop downgrading, make this not bad [MJ]
        if(this.location.upgrade === -1) return;
        this.map.addLocation(this.location.upgrade);
        if(this.location.capySkillID !== -1) this.assignCapy();
    }
    
    assignCapy(){
        const capy = this.generateCapy();
        let scene = this.scene as MainScene;
        let spriteWidth = this.scene.game.canvas.width * 0.6;
        scene.hideToolBar();
        let assignmentLayer = new CapyAssignmentModal(
            scene, 
            scene.mapLayer, 
            this.location.capyTextureCropped, 
            capy.item.icon,
            capy.item2.icon,
            capy.blockchain.name,
            capy.blockchain.stats[0],
            capy.blockchain.stats[1],
            "ASSIGN", 
            () => this.upgradeBuilding(capy),
            () => scene.showToolBar()
        );
        /*let assignmentLayer = new SpriteFocusModal(scene,scene.mapLayer,this.location.capyTexture, 300, "ASSIGN",
            () =>  this.upgradeBuilding(),
            ()=>scene.showToolBar())*/
    }
    
    generateCapy(){
        const location = this.map.getLocationInfo(this.location.upgrade);
        return new Capy(this.scene, this.map, location, this.map.mapWidth, this.map.mapHeight);
    }
    
    upgradeBuilding(newCapy: Capy) {
        this.map.addCapyForLocation(newCapy);
        this.map.removeLocation(this.location.id);
    }
}