<script lang="ts">
    import type { Pad } from "../../Pad";

    const DEFAULT_NOTE_COLOR: string = "rgb(0,0,0)";
    const DEFAULT_NOTE_BACKGROUND_COLOR: string = "rgb(200,200,200)";

    export let pad: Pad;

    const controller = pad.controller;

    const padNote = pad.noteStore;
    const padPressed = pad.pressedStore;
    const padHighlighted = pad.highlightedStore;

    $: note = $padNote;
    $: isPressed = $padPressed;
    $: isHighlighted = $padHighlighted;

    $: noteColor = note && (pad.padNoteColor?.foreground || DEFAULT_NOTE_COLOR);
    $: noteBackgroundColor =
        note && (pad.padNoteColor?.background || DEFAULT_NOTE_BACKGROUND_COLOR);
</script>

<div
    class="pad"
    class:isPressed
    class:isHighlighted
    class:isRoot={note.noteNumber === 1}
    class:isScale={note.noteNumber >= 1}
    on:mousedown={() => controller.on(pad.note, 1)}
    on:mouseup={() => controller.off(pad.note)}
    on:mouseover={(e) => {
        if (e.buttons) {
            controller.on(pad.note, 1);
        }
        pad.mouseover();
    }}
    on:mouseout={(e) => {
        if (e.buttons) {
            controller.off(pad.note);
        }
        pad.mouseout();
    }}
    style="
    --noteColor: {noteColor}; 
    --noteBackgroundColor: {noteBackgroundColor}; 
    --pressedColor: {pad.padPressedColor.foreground};
    --pressedBackgroundColor: {pad.padPressedColor.background};
    --highlightedColor: {pad.padHighlightColor.foreground};
    --highlightedBackgroundColor: {pad.padHighlightColor.background};
    --hoverColor: {pad.padHoverColor.foreground};
    --hoverBackgroundColor: {pad.padHoverColor.background};"
>
    <span class="back" />
    <span class="front"
        ><div class="note">{note.name.toString()}</div>
        {#if note.noteNumber}
            <div class="note-number">{note.noteNumber}</div>
        {/if}
    </span>
</div>

<style>
    .pad {
        margin: 0.2em;
        margin-bottom: 0.15em;
        border-radius: 0.25em;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        outline-offset: 0.1em;
        width: 4em;
        height: 3em;
        display: inline-block;
        position: relative;
        user-select: none;
    }

    .front {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 0.25em;
        display: block;

        background: var(--noteBackgroundColor);
        color: var(--noteColor);
        font-style: italic;
        text-align: center;

        transform: translateY(-0.25em);
        transition: transform 400ms cubic-bezier(0.3, 0.7, 0.4, 1);
        will-change: transform;

        pointer-events: none;
    }
    .pad:hover .front {
        transform: translateY(-0.3em);
        transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);

        background: var(--hoverBackgroundColor);
        color: var(--hoverColor);
    }

    .back {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 0.25em;
        display: block;

        background: var(--noteBackgroundColor);
        filter: brightness(50%);
    }
    .pad:hover .back {
        background: var(--hoverBackgroundColor);
    }

    .note {
        line-height: 1.5em;
        font-size: 1.25em;
    }
    .note-number {
        line-height: 1em;
        font-size: 0.75em;
    }

    .isScale .front {
        font-style: normal;
    }
    .isRoot .front {
        font-weight: bold;
    }

    .isHighlighted .front,
    .isHighlighted .back {
        color: var(--highlightedColor);
        background: var(--highlightedBackgroundColor);
    }

    .isPressed .front,
    .isPressed .back {
        color: var(--pressedColor) !important;
        background: var(--pressedBackgroundColor) !important;
    }
    .isPressed .front {
        transform: translateY(0) !important;
        transition: transform 34ms;
    }
</style>
