import { GameObjects, Scene, Textures } from 'phaser';
import type { MainScene } from './scenes/MainScene';
import BlurPassFX from '$lib/shaders/BlurPassFX';

class LayerContainer extends Phaser.GameObjects.Container {
    layer: GameLayer;

    constructor(layer: GameLayer) {
        super(layer.mainScene, 0, 0);
        layer.mainScene.add.existing(this);

        this.addToUpdateList();
        this.layer = layer;
    }

    preUpdate(time: number, delta: number) {
        if (!this.layer.updateLayer) {
            return;
        }

        this.layer.preUpdate(time, delta);
    }
}

export class GameLayer extends Phaser.Cameras.Scene2D.Camera {
    mainScene: MainScene;
    container: GameObjects.Container;

    shown: boolean;
    blurred: boolean;

    tweeningBlur: boolean;
    tweeningVisibility: boolean;

    blurStrength: number;
    blurPasses: Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[];

    updateLayer: boolean;

    constructor(scene: MainScene, shown: boolean) {
        const gameWidth = scene.game.canvas.width;
        const gameHeight = scene.game.canvas.height;

        super(shown ? 0 : gameWidth * 1.1, 0, gameWidth, gameHeight);

        this.scene = scene;
        this.mainScene = scene;

        this.shown = shown;
        this.blurred = false;
        this.blurStrength = 0;

        this.alpha = shown ? 1 : 0;
        this.inputEnabled = shown ? true : false;

        this.container = new LayerContainer(this);
        this.updateLayer = false;

        this.tweeningVisibility = false;
        this.tweeningBlur = false;

        this.roundPixels = false;
        this.setInputEnabled(shown);
    }

    addToUpdateList() {
        this.updateLayer = true;
    }

    setInteractive(hitArea: Phaser.Types.Input.InputConfiguration) {
        this.container.setInteractive(hitArea);
    }

    preUpdate(time: number, delta: number) {};

    add(child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        this.container.add(child);
    }

    onContainer(event: string, callback: any) {
        this.container.on(event, callback.bind(this));
    }

    show(duration: number) {
        if (this.shown || this.tweeningVisibility) {
            return;
        }

        this.x = this.mainScene.game.canvas.width * 1.1;
        this.alpha = 0;
        this.shown = true;

        this.tweenVisibility(duration, 'Cubic.easeOut', 'Cubic.easeIn', 0, 1, true, true);
    }

    hide(duration: number) {
        if (!this.shown || this.tweeningVisibility) {
            return;
        }

        this.x = 0;
        this.alpha = 1;
        this.shown = false;

        this.tweenVisibility(duration, 'Cubic.easeIn', 'Cubic.easeOut', -this.mainScene.game.canvas.width * 1.1, 1, false, false);
    }

    tweenVisibility(duration: number, xEase: string, alphaEase: string, targetX: number, targetAlpha: number, targetShown: boolean, enableInput: boolean) {
        this.scene.tweens.add({
            targets: this,
            duration: duration * 1000,
            props: {
                x: { value: targetX, ease: xEase },
                alpha: { value: targetAlpha, ease: alphaEase }
            },
            onStart: function (tween, targets: GameLayer[]) {
                targets[0].inputEnabled = false;
                targets[0].setInputEnabled(false);
                targets[0].tweeningVisibility = true;
            },
            onUpdate() {
                //console.log('updating...');
            },
            onComplete(tween, targets: GameLayer[]) {
                targets[0].inputEnabled = enableInput;
                targets[0].setInputEnabled(enableInput);
                targets[0].shown = targetShown;
                targets[0].tweeningVisibility = false;
            }
        });
    }

    blur(duration: number) {
        if (this.blurred || this.tweeningBlur) {
            return;
        }

        this.blurStrength = 0;
        this.blurred = true;

        this.tweenBlur(duration, 1, false);
    }

    focus(duration: number, enableInput: boolean = true) {
        if (!this.blurred || this.tweeningBlur) {
            return;
        }

        this.blurStrength = 1;
        this.blurred = false;

        this.tweenBlur(duration, 0, true);
    }

    tweenBlur(duration: number, targetStrength: number, enableInput: boolean = true) {
        
        this.scene.tweens.add({
            targets: this,
            duration: duration * 1000,
            blurStrength: targetStrength,
            ease: 'Cubic.easeInOut',
            onStart: function (tween, targets: GameLayer[]) {
                targets[0].inputEnabled = false;
                targets[0].setInputEnabled(false);
                targets[0].tweeningBlur = true;
            },
            onUpdate: function (tween, target: GameLayer, key, current, previous) {
                target.setBlurStrength(target.blurStrength);
            },
            onComplete(tween, targets: GameLayer[]) {
                targets[0].setBlurStrength(targetStrength);
                targets[0].inputEnabled = enableInput;
                targets[0].setInputEnabled(enableInput);
                targets[0].tweeningBlur = false;
            }
        });
    }

    setBlurStrength(strength: number) {
        for (const blur of this.blurPasses) {
            (<BlurPassFX>blur).setStrength(strength);
        }
    }

    ignoreLayer(otherLayer: GameLayer) {
        let children : GameObjects.GameObject[] = [otherLayer.container];

        while (children.length > 0) {
            let child = children[0];

            this.ignore(child);

            if (child instanceof GameObjects.Container) {
                children = children.concat(child.list);
            }
            
            children.splice(0, 1);
        }
    }

    initLayer() {
        this.setPostPipeline(BlurPassFX);

        let passes = this.getPostPipeline(BlurPassFX);
        this.blurPasses = 'length' in passes ? passes : [passes];

        let blur = <BlurPassFX>this.blurPasses[0];
        blur.setStrength(0);
        blur.setRadius(6);

        this.setInputEnabled(this.shown);
    }

    cleanupLayer() {
        this.container.destroy();
    }

    setInputEnabled(state: boolean) {
        let children : GameObjects.GameObject[] = [this.container];

        while (children.length > 0) {
            let child = children[0];

            if (child.input !== undefined && child.input !== null) {
                child.input.enabled = state;
            }

            if (child instanceof GameObjects.Container) {
                children = children.concat(child.list);
            }
            
            children.splice(0, 1);
        }
    }
}