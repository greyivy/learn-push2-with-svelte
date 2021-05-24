<script lang="ts">
    import type { ChordHistoryEntry } from "./ChordHistoryEntry";

    export let chord: ChordHistoryEntry;

    export let active: boolean;
</script>

<main class:active>
    <button on:click>{chord.chord.name}</button>
    <slot name="action" />
</main>

<style>
    .active {
        background: red;
    }
</style>
