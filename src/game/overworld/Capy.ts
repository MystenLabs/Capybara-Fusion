import { GameObjects, Scene, Textures } from 'phaser';
import type {CapySkillInfo, CapySkillDictionary } from './Data';
import type {ItemData, ItemDataDictionary} from "../merge/Data";
import type { Location } from './Data';
import type { Map } from './Map';
import {
    type BlockchainCapy,
    type BlockchainItem,
    type CapyStat,
    generateCapy,
    generateItem
} from "../GenerateBlockchainData";
import {stringHash} from "$lib/utils/Hashes";
import {IconModal} from "../ui/IconModal";
import TimerEvent = Phaser.Time.TimerEvent;
import {SpriteFocusModal} from "../ui/SpriteFocusModal";
import type {MainScene} from "../scenes/MainScene";

export class Capy extends GameObjects.Container {
    //TODO should the blockchain data for Capys contain info like their clothes? [MJ]
    blockchain: BlockchainCapy;
    blockchainItem: BlockchainItem;
    blockchainItem2: BlockchainItem;
    item: ItemData;
    item2: ItemData;
    sprite: GameObjects.Sprite;
    map: Map;
    capyModal: IconModal;
    pos: {x: number, y: number};
    timer: TimerEvent;
    generatedItem: ItemData;
    itemGenerationDelayMS: number;
    
    constructor(scene: Scene, map: Map, location: Location, mapWidth: number, mapHeight: number) {
        const x = mapWidth * (location.position.x + location.capyOffset.x - 0.5);
        const y = mapHeight * (location.position.y + location.capyOffset.y - 0.5);

        super(scene, x, y);
        
        this.pos = {x: x, y: y};
        
        this.map = map;

        const width = mapWidth * location.capyScale.x;
        const height = mapHeight * location.capyScale.y;

        const buildingSkillInfo = map.capySkills[location.capySkillID];
        
        this.item = this.randomCapyItem();
        this.item2 = this.randomCapyItem();
        
        //TODO user ID properly set
        this.blockchainItem = generateItem(
            this.item.name,
            'CapyHQ',
            'capyguy22',
            'CAPY_GIVEN'
        );
        this.blockchainItem2 = generateItem(
            this.item2.name,
            'CapyHQ',
            'capyguy22',
            'CAPY_GIVEN'
        );
        this.blockchain = generateCapy(
            this.skillInfoToStat(buildingSkillInfo), 
            this.skillInfoToStat(this.randomSkillFromSkillDicttionary(map.capyBoonSkills)), 
            this.blockchainItem,
            this.blockchainItem2,
            'CapyHQ',
            'capyguy22'
        )

        const mainScene = this.scene as MainScene;
        mainScene.eventMenuLayer.ledger.uploadCapy(this.blockchain);
        
        if (location.capyAnimated) {
            let frames = [];
            for (let i = 0; i < 34; i++) {
                frames.push(i);
            }

            scene.anims.create({
                key: "idle",
                frames: scene.anims.generateFrameNames(location.capyTexture, {frames: frames}),
                frameRate: 24,
                repeat: -1,
            });

            this.sprite = new GameObjects.Sprite(scene, 0, 0, location.capyTexture);
            this.add(this.sprite);

            this.sprite.play("idle", true);
        }
        else {
            this.sprite = new GameObjects.Sprite(scene, 0, 0, location.capyTexture);
            this.add(this.sprite);
        }

        this.sprite.setDisplaySize(width, height); 

        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-Math.abs(width * 0.5), -Math.abs(height * 0.5), Math.abs(width), Math.abs(height)),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: true,
        }
        this.setInteractive(hitArea);

        this.on('pointerdown', this.pointerDown);
        
        this.generatedItem = this.itemForItemName(location.generatedItem)
        this.itemGenerationDelayMS = location.itemGenerationDelayMS;
        this.capyModal = new IconModal(this.scene, this.generatedItem.icon, 0.05, -0.05, 0.11, 0.11);
        this.capyModal.visible = false;
        this.add(this.capyModal);
        this.moveDown(this.capyModal);
        this.timer = this.scene.time.addEvent({
            delay: this.itemGenerationDelayMS, // ms
            callback: ()=>this.capyModal.visible = true,
            loop: false,
        });
        this.scene.events.on('destroy', ()=>this.cleanup());
    }
    
    randomSkillFromSkillDicttionary(skillDict: CapySkillDictionary) {
        //TODO this also seems bad [MJ]
        //TODO this being random with only 3 options often feels not actually random, maybe hard coding is actually best [MJ]
        const skills = Object.values(skillDict);
        return skills[Math.floor(Math.random() * skills.length)];
    }
    
    skillInfoToStat(skillInfo: CapySkillInfo) {
        const statName = this.map.skillNameForSkillID(skillInfo.id);
        return { name: statName, rating: this.randomLevelForStat(skillInfo)} as CapyStat;
    }
    
    randomLevelForStat(skillInfo: CapySkillInfo){
        return Math.floor(Math.random() * skillInfo.maxLevel) + 1;
    }
    
    randomCapyItem(){
        const capyItems: string = this.scene.game.registry.get('capyItems');
        const capyItemName = capyItems[Math.floor(Math.random() * capyItems.length)];
        return this.itemForItemName(capyItemName)
    }
    
    itemForItemName(itemName: string){
        //TODO make global? Seems useful [MJ]
        const items: ItemDataDictionary = this.scene.game.registry.get('items');
        const desiredItem = items[stringHash(itemName)];
        return desiredItem === null ? Object.values(items)[0] : desiredItem;
    }
    
    collectItem(){
        if(!this.capyModal.visible) return;
        this.capyModal.visible = false;
        this.timer = this.scene.time.addEvent({
            delay: this.itemGenerationDelayMS, // ms
            callback: ()=>this.capyModal.visible = true,
            loop: false,
        });
        for(let i = 0; i < 3; i++) this.generateItemAndAddToInventory();
    }
    
    generateItemAndAddToInventory() {
        let inventory = this.scene.game.registry.get('inventory');
        let item: ItemData = {
            id: stringHash(this.generatedItem.name),
            name: this.generatedItem.name,
            displayName: this.generatedItem.displayName,
            icon: this.generatedItem.icon
        }
        inventory.push(item);
        this.scene.game.registry.set('inventory', inventory);
        console.log(this.scene.game.registry.get('inventory'));
    }

    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        if(!this.capyModal.visible) return;
        //TODO can we guarantee this is a MainScene? [MJ]
        let scene = this.scene as MainScene;
        let spriteWidth = this.scene.game.canvas.width * 0.6;
        let testLayer = new SpriteFocusModal(scene, scene.mapLayer, this.generatedItem.icon, spriteWidth, "COLLECT", () =>  this.collectItem());
    }
    
    cleanup(){
        this.timer.destroy();
    }
    
}