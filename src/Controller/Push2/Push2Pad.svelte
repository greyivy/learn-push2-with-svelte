<script lang="ts">
    import type { Pad } from "../../Pad";

    export let pad: Pad;

    const controller = pad.controller;

    const padNote = pad.noteStore;
    const padPressed = pad.pressedStore;
    const padHighlighted = pad.highlightedStore;

    $: note = $padNote;
    $: isPressed = $padPressed;
    $: isHighlighted = $padHighlighted;

    // TODO display intervals
</script>

<button
    class="pad"
    class:isPressed
    class:isHighlighted
    class:isRoot={note.isRoot}
    class:isScale={note.isScale}
    on:mousedown={() => controller.on(pad.note, 1)}
    on:mouseup={() => controller.off(pad.note)}
>
    <span
        class="front"
        style="--rootColor: {pad.rootColor.html}; --scaleColor: {pad.scaleColor
            .html}; --pressedColor: {pad.pressedColor
            .html}; --highlightedColor: {pad.highlightedColor.html}"
        ><div class="note">{note.name.toString()}</div>
        {#if note.dist}
            <div class="dist">{note.dist}</div>
        {/if}
    </span>
</button>

<style>
    .pad {
        margin: 4px;
        background: rgba(100, 100, 100);
        border-radius: 4px;
        border: none;
        padding: 0;
        cursor: pointer;
        outline-offset: 4px;
        width: 48px;
        height: 48px;
        display: inline-block;
    }

    .front {
        transform: translateY(-4px);
        transition: transform 400ms cubic-bezier(0.3, 0.7, 0.4, 1);
        will-change: transform;

        background: rgba(200, 200, 200);
        color: #000;

        display: block;
        text-align: center;
        /* line-height: 36px; */
        width: 48px;
        height: 48px;
        padding: 0;
        border-radius: 4px;
    }

    .note {
        line-height: 32px;
        font-size: 1.25rem;
    }
    .dist {
        line-height: 12px;
        font-size: 0.75rem;
    }

    .front:hover {
        transform: translateY(-6px);
        transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
    }
    .isScale .front {
        background: var(--scaleColor);
    }
    .isRoot .front {
        background: var(--rootColor);
    }
    .isHighlighted .front {
        background: var(--highlightedColor);
    }
    .isPressed .front {
        transform: translateY(0px);
        transition: transform 34ms;

        background: var(--pressedColor);
    }
</style>
