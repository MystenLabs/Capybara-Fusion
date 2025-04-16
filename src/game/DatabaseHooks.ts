import type { Board } from "./merge/Board";
import type { ItemID, Recipe } from "./merge/Data";

export function OnMerge(board: Board, recipe: Recipe, row: number, column: number) {
    // TODO: add merge to blockchain
}

export function OnLevelComplete(game: Phaser.Game, scene: Phaser.Scene, recipe: Recipe) {
    // TODO: add capy to blockchain
}