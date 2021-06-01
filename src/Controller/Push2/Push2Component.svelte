<script lang="ts">
    import Push2Pad from "./Push2Pad.svelte";

    import type Push2Controller from "./Push2Controller";
    import { Push2Display } from "./Push2Display";
    import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "./Push2DisplayDriver";

    export let controller: Push2Controller;

    let canvas: HTMLCanvasElement;
    let display: Push2Display;

    $: layoutRows = controller.getLayout();

    $: {
        if (controller && canvas) {
            display = Push2Display.getInstance(controller, canvas);
        }
    }
</script>

<div class="push2">
    <div class="display" on:click={() => display.initialize()}>
        <svg
            height={DISPLAY_WIDTH}
            width={DISPLAY_HEIGHT}
            viewBox="0 0 {DISPLAY_WIDTH} {DISPLAY_HEIGHT}"
            class="polygon"
        >
            <defs>
                <linearGradient id="glare" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop
                        offset="0%"
                        style="stop-color:rgb(255,255,255);stop-opacity:0.1"
                    />
                    <stop
                        offset="75%"
                        style="stop-color:rgb(255,255,255);stop-opacity:0.01"
                    />
                </linearGradient>
            </defs>
            <polygon
                points="{DISPLAY_WIDTH * -0.5},0 {DISPLAY_WIDTH *
                    1.5},0 {DISPLAY_WIDTH * 1.5},{DISPLAY_HEIGHT}"
                style="fill:url(#glare)"
            />
        </svg>
        <canvas bind:this={canvas} />
    </div>

    {#each layoutRows as layoutRow}
        <div>
            {#each layoutRow as padNumber}
                <Push2Pad pad={controller.pads[padNumber]} on:u />
            {/each}
        </div>
    {/each}
</div>

<style>
    .push2 {
        display: inline-block;
        background: #000;
        padding: 1em;
        border-radius: 0.25em;
        box-shadow: var(--box-shadow-base);
        position: relative;
    }

    .push2 .display {
        position: relative;
        width: 100%;
        padding-bottom: 16%; /* Screen aspect ratio */
        margin-bottom: 1em;
        border-radius: 0.25em;
        background: rgb(25, 25, 25);
        cursor: pointer;
    }

    .push2 .display > * {
        position: absolute !important;
        width: 100% !important;
        height: 100% !important;
        left: 0;
        top: 0;
        border-radius: 2px;
    }

    .push2 .display svg {
        z-index: 1;
    }
</style>
