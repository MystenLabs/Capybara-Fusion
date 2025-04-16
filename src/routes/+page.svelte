<script lang="ts">

    import type { Scene } from "phaser";
    import PhaserGame, { type TPhaserRef } from "../game/PhaserGame.svelte";

    // The sprite can only be moved in the MainMenu Scene
    let canMoveSprite = false;

    //  References to the PhaserGame component (game and scene are exposed)
    let phaserRef: TPhaserRef = { game: null, scene: null};
    const spritePosition = { x: 0, y: 0 };

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Scene) => {

        //canMoveSprite = (scene.scene.key !== "MainMenu");

    }
    
</script>

<div id="app">
    <PhaserGame bind:phaserRef={phaserRef} currentActiveScene={currentScene} />
</div>

<style>
    #app {
        width: 100%;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
