import { GameObjects, Scene } from 'phaser';
import { Item } from './Item';
import { InventoryItem } from './InventoryItem';
import type { MainScene } from '../scenes/MainScene';

export function MergeTransition(dragged: Item | InventoryItem, target: Item | InventoryItem, spawned: Item | InventoryItem) {
    if (dragged.input !== null) {
        dragged.input.enabled = false;
    }

    if (target.input !== null) {
        target.input.enabled = false;
    }

    dragged.scene.tweens.add({
        targets: dragged,
        props: {
            x: target.x,
            y: target.y,
            scale: 0.25
        },
        ease: 'Cubic.easeOut',
        duration: 250,
        onComplete: () => {
            dragged.destroy();
        }
    });

    target.scene.tweens.add({
        targets: target,
        props: {
            scale: 0.25
        },
        ease: 'Cubic.easeOut',
        duration: 250,
        onComplete: () => {
            target.destroy();
        }
    });

    ItemFade(dragged, 0, .15, 0);
    ItemFade(target, 0, .15, 0);
    ItemSpawnTransition(spawned, 0.1);
}


export function MoveTransition(item: Item | InventoryItem, x: number, y: number) {
    if (item.input !== null) {
        item.input.enabled = false;
    }

    item.scene.tweens.add({
        targets: item,
        props: {
            x: x,
            y: y
        },
        ease: 'Cubic.easeOut',
        duration: 250,
        onComplete: () => {
            let scene = <MainScene>item.scene;
            if (item.input !== null) {
                item.input.enabled = scene.mergeModalLayer.shown;
            }
        }
    });
}

export function ItemSpawnTransition(item: Item | InventoryItem, delay: number) {
    if (item.input !== null) {
        item.input.enabled = false;
    }

    item.sprite.alpha = 0;
    ItemFade(item, 1, 0.1, delay);

    item.scale = 0.25;
    item.scene.tweens.add({
        targets: item,
        props: {
            scale: 1,
        },
        ease: (t: number) => {
            let w = Math.tanh(8 * (t - 0.5)) * 0.5 + 0.5;
            let t2 = 2.5 - Math.pow(2.635 * (t - 0.6), 2);
            return ((1 - w) * t2) + w
        },
        duration: 250,
        delay: delay * 1000,
        onComplete: () => {
            let scene = <MainScene>item.scene;
            if (item.input !== null) {
                item.input.enabled = scene.mergeModalLayer.shown;
            }
        }
    });
}

export function ItemFade(item: Item | InventoryItem, alpha: number, duration: number, delay: number) {
    item.scene.tweens.add({
        targets: item.sprite,
        props: {
            alpha: alpha,
        },
        ease: 'Cubic.easeIn',
        duration: duration * 1000,
        delay: delay * 1000
    });
}

export function ItemGlow(item: Item | InventoryItem) {
    item.glow = item.sprite.preFX?.addGlow(0x5BDBFF, 0, 0, false, 0.2, 24);

    return item.scene.tweens.add({
        targets: item.glow,
        props: {
            outerStrength: 6
        },
        yoyo: true,
        loop: -1,
        ease: 'Sine.easeInOut'
    });
}