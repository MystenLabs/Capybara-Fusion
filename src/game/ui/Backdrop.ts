import { GameObjects, Scene, Textures } from 'phaser';

export function createBackdrop(scene: Phaser.Scene, x: number, y: number, width: number, height: number): GameObjects.NineSlice {
    return new Phaser.GameObjects.NineSlice(scene, x, y, 'ui_box', 0, Math.max(width, 400), Math.max(height, 100), 200, 200, 50, 50);
}