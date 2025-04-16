import TextureList from '$lib/textures.json';
import SpriteSheetList from '$lib/sprite_sheets.json';

export type SerializedTexture = {
    name: string,
    path: string,
};

export type SerializedSpriteSheet = {
    name: string,
    path: string,
    frame_width: number,
    frame_height: number,
};

export function LoadTextures(preloaderScene: Phaser.Scene) {
    const textures: SerializedTexture[] = TextureList;
    const spriteSheets: SerializedSpriteSheet[] = SpriteSheetList;

    for (const texture of textures) {
        preloaderScene.load.image(texture.name, texture.path);
    }

    for (const sheet of spriteSheets) {
        preloaderScene.load.spritesheet(sheet.name, sheet.path, { frameWidth: sheet.frame_width, frameHeight: sheet.frame_height });
    }

    preloaderScene.load.video('fanfare', 'fanfare.mp4', true);
};