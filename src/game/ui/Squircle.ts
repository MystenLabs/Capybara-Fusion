import { GameObjects, Scene, Textures } from 'phaser';

export function createSquircle(scene: Phaser.Scene, x: number, y: number, width: number, height: number, tint: number = 0xffffff, alpha: number = 1): GameObjects.NineSlice {
    let squircle = new Phaser.GameObjects.NineSlice(scene, x, y, 'squircle', 0, Math.max(width, 60), Math.max(height, 60), 30, 30, 30, 30);
    squircle.tint = tint;
    squircle.alpha = alpha;
    return squircle;
}