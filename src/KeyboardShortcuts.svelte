<script lang="ts">
    import { rootLetter, rootOctave } from "./configurationStore";
    import { getNext, getPrevious, NOTES, OCTAVES } from "./helpers";

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "ArrowUp") {
            e.preventDefault()
            rootOctave.update((rootOctave) => getNext(rootOctave, OCTAVES));
        } else if (e.key === "ArrowDown") {
            e.preventDefault()
            rootOctave.update((rootOctave) => getPrevious(rootOctave, OCTAVES));
        } else if (e.key === "ArrowRight") {
            e.preventDefault()
            rootLetter.update((rootLetter) => getNext(rootLetter, NOTES));
        } else if (e.key === "ArrowLeft") {
            e.preventDefault()
            rootLetter.update((rootLetter) => getPrevious(rootLetter, NOTES));
        } else {
            // console.debug(e.key)
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />
