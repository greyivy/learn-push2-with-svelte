<script lang="ts">
    import type { ChordNotes } from "./chordUtils";

    export let chord: ChordNotes;

    export let active: boolean = false;
</script>

<div class="item" class:active on:click>
    {chord.chord.name}
    <slot name="action" />
</div>

<style>
    .item {
        position: relative;
        width: 100%;
        padding: 1em;
        line-height: 1;
        box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        margin: 0 0 0.5em 0;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
        text-transform: uppercase;
        cursor: pointer;

        background: var(--apricot);
    }
    .item.active {
        background: var(--english-lavender);
        color: var(--text-light);
        font-weight: bold;
    }

    .item :global(button) {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
    }
    .item.active :global(button) {
        color: var(--text-light);
    }

    .item :global(button:hover) {
        background: rgba(255, 255, 255, 0.4);
    }
</style>
