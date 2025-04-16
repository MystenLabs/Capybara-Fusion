import { GameObjects, Scene, Textures } from 'phaser';
import { SecondOrderDynamics } from '$lib/utils/Dynamics';
import type { Location, LocationDictionary, CapySkillDictionary } from './Data';
import { stringHash } from '$lib/utils/Hashes';
import { MapLocation } from './MapLocation';
import {Capy} from "./Capy";
import type { MainScene } from '../scenes/MainScene';
import { GameLayer } from '../GameLayer';
import C = Phaser.Input.Keyboard.KeyCodes.C;


export class Map extends GameLayer {
    mover: GameObjects.Container;
    baseMap: GameObjects.Sprite;
    locations: Record<number, MapLocation>;
    capys: Record<number, Capy>;
    capySkills: CapySkillDictionary;
    capyBoonSkills: CapySkillDictionary;
    capyNames: string[];
    
    mapWidth: number;
    mapHeight: number;

    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;

    dragging: boolean;
    velocity: Phaser.Math.Vector2;
    drag: number;

    initialX: number;
    initialY: number;
    pointerX: number;
    pointerY: number;
    
    timerInterval: number;

    constructor(scene: MainScene, shown: boolean, texture: string) {
        let x = scene.game.canvas.width * 0.5;
        let y = scene.game.canvas.height * 0.5;

        const baseTexture = scene.game.textures.get(texture);
        const texWidth = baseTexture.source[0].width;
        const texHeight = baseTexture.source[0].height;

        let gameWidth = scene.game.canvas.width;
        let gameHeight = scene.game.canvas.height;

        super(scene, shown);
        this.addToUpdateList();

        this.container.x = x;
        this.container.y = y;

        this.mover = new GameObjects.Container(scene, 0, 0);
        this.add(this.mover);

        this.baseMap = new GameObjects.Sprite(scene, 0, 0, baseTexture);

        const scalar = gameHeight > gameWidth ? gameHeight / texHeight : gameWidth / texWidth;
        this.mapWidth = texWidth * scalar;
        this.mapHeight = texHeight * scalar;

        this.baseMap.setDisplaySize(this.mapWidth, this.mapHeight);
        this.mover.add(this.baseMap);

        if (gameHeight > gameWidth) {
            const xRange = (this.mapWidth - gameWidth) * 0.5;
            this.xMin = -xRange;
            this.xMax = xRange;
            this.yMin = 0;
            this.yMax = 0;
        }
        else {
            const yRange = (this.mapHeight - gameHeight) * 0.5;
            this.yMin = -yRange;
            this.yMax = yRange;
            this.xMin = 0;
            this.xMax = 0;
        }

        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-gameWidth * 0.5, -gameHeight * 0.5, gameWidth, gameHeight),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: false,
        }
        this.setInteractive(hitArea);

        this.onContainer('pointerdown', this.pointerDown);
        this.onContainer('pointermove', this.pointerMove);
        this.onContainer('pointerup', this.pointerUp);

        this.drag = 5;
        this.dragging = false;
        this.velocity = new Phaser.Math.Vector2(0, 0);

        this.locations = {};
        this.capys = {};

        this.addLocation(stringHash('windmill_2'));
        this.addLocation(stringHash('greenhouse_2'));
        this.addLocation(stringHash('dock_broken'));
        this.addLocation(stringHash('shop_2'));
        
        this.capySkills = this.scene.game.registry.get('capySkills');
        this.capyBoonSkills = this.scene.game.registry.get('capyBoonSkills');
        this.capyNames = this.scene.game.registry.get('capyNames');
        this.timerInterval = setInterval(() => {
            let timeLeft = this.scene.game.registry.get('timeRemaining');
            timeLeft = timeLeft - 1000;
            this.scene.game.registry.set('timeRemaining', timeLeft);

            if (timeLeft < 0) {
                clearInterval(this.timerInterval);
            }
        }, 1000);
        this.scene.events.on('destroy', ()=>this.cleanup());
    }
    
    cleanup(){
        clearInterval(this.timerInterval);
    }

    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        this.dragging = true;
        this.velocity = new Phaser.Math.Vector2(0, 0);

        this.initialX = this.mover.x;
        this.initialY = this.mover.y;

        this.pointerX = x;
        this.pointerY = y;
    }

    pointerMove(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        if (!this.dragging) {
            return;
        }

        this.mover.x = Phaser.Math.Clamp(this.initialX + (x - this.pointerX), this.xMin, this.xMax);
        this.mover.y = Phaser.Math.Clamp(this.initialY + (y - this.pointerY), this.yMin, this.yMax);
        this.velocity = new Phaser.Math.Vector2(pointer.velocity.scale(10)); // 10x the velocity feels the nicest, couldn't tell you why.
    }

    pointerUp(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        this.dragging = false;
    }

    preUpdate(time: number, delta: number) {
        const dt = delta / 1000;

        if (!this.dragging) {
            this.velocity.subtract(new Phaser.Math.Vector2(
                this.velocity.x * this.drag * dt,
                this.velocity.y * this.drag * dt
            ));
    
            this.mover.x = Phaser.Math.Clamp(this.mover.x + this.velocity.x * dt, this.xMin, this.xMax);
            this.mover.y = Phaser.Math.Clamp(this.mover.y + this.velocity.y * dt, this.yMin, this.yMax);
        }
    }

    getLocationInfo(locationID: number) {
        const locations: LocationDictionary = this.scene.game.registry.get('locations');
        return locations[locationID];
    }
    
    addLocation(locationID: number) {
        const location = this.getLocationInfo(locationID);

        const mapLocation = new MapLocation(this.scene, this, location, this.mapWidth, this.mapHeight);
        this.mover.add(mapLocation);
        this.locations[locationID] = mapLocation;
    }
    
    addCapyForLocation(newCapy: Capy) {
        this.mover.add(newCapy);
        this.capys[stringHash(newCapy.blockchain.capyID)] = newCapy;
    }
    
    removeCapy(capyID: number) {
        this.capys[capyID].destroy();
        delete this.capys[capyID];
    }

    removeLocation(locationID: number) {
        this.locations[locationID].destroy();
        delete this.locations[locationID];
    }
    
    skillNameForSkillID(skillID: number) {
        //TODO this also sucks I think [MJ]
        return skillID <= 1000 ? this.capySkills[skillID].displayName : this.capyBoonSkills[skillID].displayName;
    }
}