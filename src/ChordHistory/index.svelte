<script lang="ts">
    import { detect } from "@tonaljs/chord-detect";
    import { get as getChord } from "@tonaljs/chord";
    import type { Note } from "@tonaljs/core";
    import type { Chord } from "@tonaljs/chord";
    import { note, distance } from "@tonaljs/core";
    import type { Controller } from "../Controller";
    import type { ChordHistoryEntry } from "./ChordHistoryEntry";
    import ChordHistoryItem from "./ChordHistoryItem.svelte";

    export let controller: Controller;

    const { notes: controllerNotes } = controller;

    let chord: ChordHistoryEntry;

    let chordBankAdvance: boolean;
    let chordBankHighlight: boolean;

    $: notes = [...$controllerNotes];
    $: {
        chord = null;

        if (notes.length) {
            const chords = detect(notes.map((n) => n.pc));

            for (const currentChord of chords) {
                let parsedChord = getChord(currentChord);
                if (!parsedChord.empty) {
                    chord = {
                        chord: parsedChord,
                        notes: notes,
                    };
                    chordHistory.push(chord);
                    chordHistory = chordHistory;
                    break;
                }
            }
        }
    }

    let chordHistory: ChordHistoryEntry[] = [];
    let chordBank: ChordHistoryEntry[] = [];

    function addToChordBank(chord: ChordHistoryEntry) {
        chordBank.push(chord);
        chordBank = chordBank;
    }
    function removeFromChordBank(index: number) {
        chordBank.splice(index, 1);
        chordBank = chordBank;
    }

    function highlightChord(chord: ChordHistoryEntry) {
        controller.highlightNotes(chord.notes);
    }
</script>

<main>
    {#if chord}
        Chord: {chord.chord.name}
    {/if}

    <ul>
        {#each chordHistory as chord}
            <li>
                <ChordHistoryItem
                    {chord}
                    on:click={() => highlightChord(chord)}
                >
                    <span slot="action">
                        <button on:click={() => addToChordBank(chord)}>+</button
                        >
                    </span>
                </ChordHistoryItem>
            </li>
        {/each}
    </ul>

    <hr />

    <ul>
        {#each chordBank as chord, i}
            <li>
                <ChordHistoryItem
                    {chord}
                    on:click={() => highlightChord(chord)}
                >
                    <span slot="action">
                        <button on:click={() => removeFromChordBank(i)}
                            >-</button
                        >
                    </span>
                </ChordHistoryItem>
            </li>
        {/each}

        [ ] Advance and highlight
    </ul>
</main>

<style>
</style>
