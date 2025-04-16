<script context="module" lang="ts">

    import type { Game, Scene } from "phaser";

    export type TPhaserRef = {
        game: Game | null,
        scene: Scene | null
    };

</script>

<script lang="ts">

    import { onMount } from "svelte";
    import StartGame from "./main";
    import { EventBus } from './EventBus';

    export let phaserRef: TPhaserRef = {
        game: null,
        scene: null
    };

    export let currentActiveScene: (scene: Scene) => void | undefined;

    function resizeCanvas() {
        let canvas = <any>document.querySelector('canvas');
        canvas.style.height = `${window.innerHeight}px`;
    }

    onMount(() => {
        window.onresize = resizeCanvas;

        document.fonts.load('10pt Quantico').then(() => {
            phaserRef.game = StartGame("game-container");

            resizeCanvas();
            
            EventBus.on('current-scene-ready', (scene_instance: Scene) => {

                phaserRef.scene = scene_instance;

                if(currentActiveScene)
                {
                    
                    currentActiveScene(scene_instance);
                    
                }

            });
        })
    });

</script>

<style>
    :global(body) {
        margin: 0;
    }
    :global(#app) {
        width: 100% !important;
        height: 100% !important;
    }
    #game-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>

<div id="game-container"></div>