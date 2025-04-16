import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { Map } from '../overworld/Map';
import { Toolbar } from '../ui/Toolbar';
import { GameLayer } from '../GameLayer';
import { MergeModal } from '../merge/MergeModal';
import { EventMenu } from '../event_menu/EventMenu';
import { createBackdrop } from '../ui/Backdrop';
import BlurPassFX from '$lib/shaders/BlurPassFX';
import {WonderpickModal} from "../wonderpick/WonderpickModal";
import { generateCapy, generateItem, type CapyStat } from '../GenerateBlockchainData';
import type { CapySkillDictionary, CapySkillInfo } from '../overworld/Data';
import type { ItemDataDictionary } from '../merge/Data';
import { stringHash } from '$lib/utils/Hashes';
import { createSquircle } from '../ui/Squircle';
import { ProfileInfo } from '../ui/ProfileInfo';

export class MainScene extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    layers: GameLayer[];

    mapLayer: Map;
    mergeModalLayer: MergeModal;
    wonderpickModalLayer: WonderpickModal;
    eventMenuLayer: EventMenu;
    toolBarLayer: GameLayer;

    toolBar: Toolbar;

    constructor ()
    {
        super('MainScene');
    }

    create ()
    {
        (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.addPostPipeline(
            'BlurPassFX',
            BlurPassFX,
        );

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xffffff);

        const gameWidth = this.game.canvas.width;
        const gameHeight = this.game.canvas.height;

        this.layers = [];

        this.mapLayer = new Map(this, true, 'overworld_base');
        this.addLayer(this.mapLayer, true);
        this.mapLayer.initLayer();
        
        this.eventMenuLayer = new EventMenu(this, false);
        this.addLayer(this.eventMenuLayer);
        this.eventMenuLayer.initLayer();

        this.toolBar = new Toolbar(this, 150, gameWidth * 0.9, 85, 0, 55);

        var profile = new GameObjects.Sprite(this, gameWidth - 80, 80, 'user');
        profile.setDisplaySize(120, 120);

        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(0, 0, 120, 120),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: true,
        }
        const profileOpen = new Phaser.GameObjects.Zone(this, gameWidth - 80, 80, 120, 120);
        profileOpen.setInteractive(hitArea);
        profileOpen.on('pointerdown', () => this.openProfile());


        var squircle = createSquircle(this, gameWidth - 80, 80 - 50, 200, 60, 0xffffff, 0.85);
        squircle.setOrigin(1, 0);

        var text = new GameObjects.Text(this, gameWidth - 260, 60, "capyguy22", { fontSize: '20px', fontFamily: "Quantico", color: "#000" });
        text.setOrigin(0, 0.5);

        this.toolBarLayer = new GameLayer(this, true);

        this.toolBarLayer.add(this.toolBar);
        this.toolBarLayer.add(squircle);
        this.toolBarLayer.add(profile);
        this.toolBarLayer.add(text);
        this.toolBarLayer.add(profileOpen);

        this.addLayer(this.toolBarLayer);
        this.toolBarLayer.initLayer();

        this.mergeModalLayer = new MergeModal(this, false);
        this.addLayer(this.mergeModalLayer);
        this.mergeModalLayer.initLayer();

        this.wonderpickModalLayer = new WonderpickModal(this, false);
        this.addLayer(this.wonderpickModalLayer);
        this.wonderpickModalLayer.initLayer();
        
        this.updateLayers();
        this.uploadDummyData();

        EventBus.emit('current-scene-ready', this);
    }

    addLayer(layer: GameLayer, mainLayer: boolean = false) {
        this.cameras.addExisting(layer, true);
        this.layers.push(layer);
    }

    destroyLayer(layer: GameLayer) {
        layer.cleanupLayer();
        this.layers.splice(this.layers.indexOf(layer), 1);
        this.cameras.remove(layer, true);
        this.updateLayers();
    }

    insertLayer(layer: GameLayer, index: number) {
        this.layers.splice(index, 0, layer);

        if (index > 0) {
            let camerasIndex = this.cameras.cameras.indexOf(this.layers[index - 1]);
            this.cameras.cameras.splice(camerasIndex + 1, 0, layer);
        }
        else if (this.layers.length > 0) {
            let camerasIndex = this.cameras.cameras.indexOf(this.layers[0]);
            this.cameras.cameras.splice(Math.max(camerasIndex - 1, 0), 0, layer);
        }
        else {
            this.cameras.cameras.push(layer);
        }
    }

    updateLayers() {
        for (const layer of this.layers) {
            for (const otherLayer of this.layers) {
                if (layer === otherLayer) {
                    continue;
                }

                layer.ignoreLayer(otherLayer);
            }
        }
    }

    showToolBar() {
        this.toolBar.showBar();
    }

    hideToolBar() {
        this.toolBar.hideBar();
    }

    showMergeModal() {
        this.mapLayer.blur(0.333);
        this.mergeModalLayer.show(0.333);
        this.eventMenuLayer.hide(0.333);
    }

    hideMergeModal() {
        this.mapLayer.focus(0.333);
        this.mergeModalLayer.hide(0.333);
    }
    
    showWonderpickModal() {
        this.hideToolBar();
        this.mapLayer.blur(0.333);
        this.wonderpickModalLayer.show(0.333);
        this.eventMenuLayer.hide(0.333);
    }

    hideWonderpickModal() {
        this.showToolBar();
        this.mapLayer.focus(0.333);
        this.wonderpickModalLayer.hide(0.333);
    }

    showEventMenu() {
        this.hideToolBar();
        this.mapLayer.blur(0.333);
        this.eventMenuLayer.show(0.333);
        this.mergeModalLayer.hide(0.333);
    }

    hideEventMenu() {
        this.showToolBar();
        this.mapLayer.focus(0.333);
        this.eventMenuLayer.hide(0.333);
    }

    uploadDummyData() {
        this.eventMenuLayer.ledger.uploadItem(generateItem('high_tech_telescope', '2go_time', 'i_luvcapy', 'PICK'));
        this.uploadRandomCapy('Rollo', 'i_luvcapy');
        this.eventMenuLayer.ledger.uploadItem(generateItem('high_tech_telescope', 'CapyHQ', '2go_time', 'MERGE'));
        this.eventMenuLayer.ledger.uploadItem(generateItem('lawn_mower', 'nuphwo', 'i_luvcapy', 'PICK'));
        this.uploadRandomCapy('Gupta', 'JayDino3');
        this.eventMenuLayer.ledger.uploadItem(generateItem('high_tech_telescope', 'i_luvcapy', 'CapyHQ', 'DONATE'));
        this.eventMenuLayer.ledger.uploadItem(generateItem('tree_fruiting', 'CapyHQ', 'nuphwo', 'MERGE'));
        this.uploadRandomCapy('Remy', 'nuphwo');
        this.eventMenuLayer.ledger.uploadItem(generateItem('motor_boat', 'CapyHQ', 'i_luvcapy', 'MERGE'));
        this.eventMenuLayer.ledger.uploadItem(generateItem('high_tech_telescope', 'i_luvcapy', 'everlove', 'MERGE'));
    }

    uploadRandomCapy(name: string, toUser: string) {
        let item = this.randomCapyItem();
        let item2 = this.randomCapyItem();
        
        //TODO user ID properly set
        let blockchainItem1 = generateItem(
            item.name,
            'CapyHQ',
            toUser,
            'CAPY_GIVEN'
        );

        let blockchainItem2 = generateItem(
            item2.name,
            'CapyHQ',
            toUser,
            'CAPY_GIVEN'
        );

        let capy = generateCapy(
            this.skillInfoToStat(this.randomSkillFromSkillDicttionary(this.mapLayer.capySkills)), 
            this.skillInfoToStat(this.randomSkillFromSkillDicttionary(this.mapLayer.capyBoonSkills)), 
            blockchainItem1,
            blockchainItem2,
            'CapyHQ',
            toUser
        );

        capy.name = name;
        
        this.eventMenuLayer.ledger.uploadCapy(capy);
    }

    randomSkillFromSkillDicttionary(skillDict: CapySkillDictionary) {
        //TODO this also seems bad [MJ]
        //TODO this being random with only 3 options often feels not actually random, maybe hard coding is actually best [MJ]
        const skills = Object.values(skillDict);
        return skills[Math.floor(Math.random() * skills.length)];
    }
    
    skillInfoToStat(skillInfo: CapySkillInfo) {
        const statName = this.mapLayer.skillNameForSkillID(skillInfo.id);
        return { name: statName, rating: this.randomLevelForStat(skillInfo)} as CapyStat;
    }
    
    randomLevelForStat(skillInfo: CapySkillInfo){
        return Math.floor(Math.random() * skillInfo.maxLevel) + 1;
    }
    
    randomCapyItem(){
        const capyItems: string = this.game.registry.get('capyItems');
        const capyItemName = capyItems[Math.floor(Math.random() * capyItems.length)];
        return this.itemForItemName(capyItemName)
    }
    
    itemForItemName(itemName: string){
        //TODO make global? Seems useful [MJ]
        const items: ItemDataDictionary = this.game.registry.get('items');
        const desiredItem = items[stringHash(itemName)];
        return desiredItem === null ? Object.values(items)[0] : desiredItem;
    }

    openProfile() {
        new ProfileInfo(this, this.toolBarLayer);
    }
}
