<script lang="ts">
    import { detect } from "@tonaljs/chord-detect";
    import { get as getChord, reduced } from "@tonaljs/chord";
    import type { Controller } from "../Controller";
    import type { ChordHistoryEntry } from "./ChordHistoryEntry";
    import ChordHistoryItem from "./ChordHistoryItem.svelte";

    export let controller: Controller;

    const CHORD_HISTORY_LENGTH = 6;

    const { notes: controllerNotes } = controller;

    let chord: ChordHistoryEntry;

    let currentChordBankIndex: number = 0;
    let chordBankAdvance: boolean = true; // TODO false
    let chordBankHighlight: boolean = true;

    $: notes = [...$controllerNotes];
    $: {
        chord = null;

        if (notes.length > 1) {
            let chordNotes = [...notes];
            for (let i = 0; i < chordNotes.length; i++) {
                // Shift array to the left and try again
                const firstNote = chordNotes.shift();
                chordNotes.push(firstNote);

                let chords = detect(chordNotes.map((n) => n.pc));

                for (const currentChord of chords) {
                    let parsedChord = getChord(currentChord);
                    // https://github.com/tonaljs/tonal/issues/242
                    if (
                        !parsedChord.empty &&
                        parsedChord.type !== "minor augmented"
                    ) {
                        chord = {
                            chord: parsedChord,
                            notes: chordNotes,
                        };

                        // Add to beginning of chordHistory and trim
                        chordHistory.splice(0, 0, chord);
                        chordHistory = chordHistory.slice(
                            0,
                            CHORD_HISTORY_LENGTH
                        );

                        // Advance chordBank if needed
                        if (chordBankAdvance) {
                            if (
                                chordBank.length &&
                                chordBank[currentChordBankIndex]?.chord
                                    .symbol === chord.chord.symbol
                            ) {
                                advanceChordBank();
                            }
                        }

                        break;
                    }
                }

                if (chord) {
                    break;
                }
            }
        }
    }

    let chordHistory: ChordHistoryEntry[] = [];
    let chordBank: ChordHistoryEntry[] = [];

    function addToChordBank(chord: ChordHistoryEntry) {
        setChordBankIndex(0);
        chordBank.push(chord);
        chordBank = chordBank;
    }
    function removeFromChordBank(index: number) {
        currentChordBankIndex = 0;
        chordBank.splice(index, 1);
        chordBank = chordBank;
        setChordBankIndex(0);
    }

    function setChordBankIndex(index: number) {
        currentChordBankIndex = index;

        if (chordBankHighlight) {
            controller.highlightClear();
            if (chordBank[currentChordBankIndex]) {
                highlightChord(chordBank[currentChordBankIndex]);
            }
        }
    }

    function advanceChordBank() {
        if (currentChordBankIndex === chordBank.length - 1) {
            setChordBankIndex(0);
        } else {
            setChordBankIndex(currentChordBankIndex + 1);
        }
    }

    function highlightChord(chord: ChordHistoryEntry) {
        controller.highlightClear();
        controller.highlightNotes(chord.notes);
    }
</script>

<main>
    {#if chord}
        Chord: {chord.chord.name}
    {/if}

    <button on:click={() => controller.highlightClear()}>clear</button>

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
                    active={i === currentChordBankIndex}
                    on:click={() => setChordBankIndex(i)}
                >
                    <span slot="action">
                        <button on:click={() => removeFromChordBank(i)}
                            >-</button
                        >
                    </span>
                </ChordHistoryItem>
            </li>
        {/each}

        <!--[ ] Advance and highlight-->
    </ul>
</main>

<style>
</style>
