<script lang="ts">
    import type { Pad } from "../Pad";

    const DEFAULT_NOTE_COLOR: string = "rgb(0,0,0)";
    const DEFAULT_NOTE_BACKGROUND_COLOR: string = "rgb(200,200,200)";

    export let pad: Pad;

    const controller = pad.controller;

    const { note, pressed, highlighted, hovered } = pad;

    // Adding $note ensures reactivity
    $: noteColor =
        $note && (pad.padNoteColor?.foreground || DEFAULT_NOTE_COLOR);
    $: noteBackgroundColor =
        $note &&
        (pad.padNoteColor?.background || DEFAULT_NOTE_BACKGROUND_COLOR);
</script>

<div
    class="pad"
    class:pressed={$pressed}
    class:highlighted={$highlighted}
    class:hovered={$hovered}
    class:rootNote={$note.noteNumber === 1}
    class:scaleNote={$note.noteNumber >= 1}
    on:mousedown={() => controller.noteOn(pad.getNote(), 1)}
    on:mouseup={() => controller.noteOff(pad.getNote())}
    on:mouseover={(e) => {
        // Allow dragging
        if (e.buttons) {
            controller.noteOn(pad.getNote(), 1);
        }
        controller.hoverNoteOn(pad.getNote());
    }}
    on:mouseout={(e) => {
        // Allow dragging
        if (e.buttons) {
            controller.noteOff(pad.getNote());
        }
        controller.hoverNoteOff(pad.getNote());
    }}
    style="
    --noteColor: {noteColor}; 
    --noteBackgroundColor: {noteBackgroundColor};
    "
>
    <span class="back" />
    <span class="front"
        ><div class="note">{$note.name.toString()}</div>
        {#if $note.noteNumber}
            <div class="note-number">{$note.noteNumber}</div>
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

    .scaleNote .front {
        font-style: normal;
    }
    .rootNote .front {
        font-weight: bold;
    }

    .highlighted .front,
    .highlighted .back {
        color: var(--highlightedColor);
        background: var(--highlightedBackgroundColor);
    }

    .pressed .front,
    .pressed .back {
        color: var(--pressedColor) !important;
        background: var(--pressedBackgroundColor) !important;
    }
    .pressed .front {
        transform: translateY(0) !important;
        transition: transform 34ms;
    }

    .hovered .front,
    .pad:hover .front {
        background: var(--hoverBackgroundColor);
        color: var(--hoverColor);
    }
</style>
