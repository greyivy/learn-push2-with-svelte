<script lang="ts">
    import type { ChordNotes } from "./chordUtils";
    import { chordDetect, getProgression } from "./chordUtils";
    import type { Controller } from "../Controller";

    import Progressions from "./Progressions.svelte";

    import ChordHistoryItem from "./ChordHistoryItem.svelte";
    import { Row, Col, Icon } from "svelte-chota";
    import { mdiDelete, mdiArrowRight } from "@mdi/js";

    import { fade, fly } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { chord } from "./chordStore";

    import {
        inputId,
        outputId,
        controllerConfiguration,
        synthConfiguration,
        layoutGeneratorConfiguration,
        scaleName,
        rootLetter,
        rootOctave,
    } from "../configurationStore";

    export let controller: Controller;

    const CHORD_HISTORY_LENGTH = 6;

    const { notes: controllerNotes } = controller;

    let chordNotes: ChordNotes;

    let currentChordBankIndex: number = 0;
    let chordBankAdvance: boolean = true; // TODO false
    let chordBankHighlight: boolean = true;

    let chordHistoryTimeout = null;

    function addToChordHistory(chordNotes?) {
        if (chordHistoryTimeout) {
            clearTimeout(chordHistoryTimeout);
        }

        if (chordNotes) {
            // Ensure notes are held for at least xyz ms
            chordHistoryTimeout = setTimeout(() => {
                // Add to beginning of chordHistory and trim
                chordHistory.splice(0, 0, chordNotes);
                chordHistory = chordHistory.slice(0, CHORD_HISTORY_LENGTH);
                chordHistoryTimeout = null;
            }, 250);
        }
    }

    $: notes = [...$controllerNotes];
    $: {
        chordNotes = notes.length > 1 ? chordDetect(notes) : null;

        chord.set(chordNotes);

        if (chordNotes) {
            addToChordHistory(chordNotes);

            // Advance chordBank if needed
            if (
                chordBankAdvance &&
                chordBank.length &&
                chordBank[currentChordBankIndex]?.chord.normalized ===
                    chordNotes.chord.normalized
            ) {
                // Note: ignores octaves, note order(?)
                advanceChordBank();
            }
        } else {
            addToChordHistory();
        }
    }

    // TODO make there a delay before adding a chord to history! if it changes before the delay is up, start over and don't add it!

    let chordHistory: ChordNotes[] = [];
    let chordBank: ChordNotes[] = [];

    function addToChordBank(chord: ChordNotes) {
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
    function clearChordBank() {
        currentChordBankIndex = 0;
        chordBank = [];
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

    function highlightChord(chord: ChordNotes) {
        controller.highlightClear();
        controller.highlightNotes(chord.notes);
    }

    function populateProgression(
        root: string,
        octave: number,
        progression: string
    ) {
        clearChordBank();

        for (const chordNotes of getProgression(
            root,
            $rootOctave,
            progression
        )) {
            addToChordBank(chordNotes);
        }
    }
</script>

<div>
    <Row>
        <Col>
            <h2>
                Chord: {chordNotes?.chord.name || "none"}
            </h2>

            <Progressions
                onSelect={(root, progression) =>
                    populateProgression(root, 3, progression)}
            />

            <button on:click={() => controller.highlightClear()}>Clear</button>
        </Col>
    </Row>

    <Row>
        <Col>
            <div>
                <h4>Chord history</h4>
                {#each chordHistory as chord, i (chord)}
                    <div animate:flip in:fade out:fly={{ x: 100 }}>
                        <ChordHistoryItem
                            {chord}
                            on:click={(e) => {
                                e.stopPropagation();
                                highlightChord(chord);
                            }}
                        >
                            <button
                                slot="action"
                                on:click={() => addToChordBank(chord)}
                                ><Icon
                                    src={mdiArrowRight}
                                    size="24px"
                                /></button
                            >
                        </ChordHistoryItem>
                    </div>
                {/each}
            </div>
        </Col>
        <Col>
            <div>
                <h4>Chord playlist</h4>
                {#each chordBank as chord, i (chord)}
                    <div animate:flip in:fade out:fly={{ x: 100 }}>
                        <ChordHistoryItem
                            {chord}
                            active={i === currentChordBankIndex}
                            on:click={() => setChordBankIndex(i)}
                        >
                            <button
                                slot="action"
                                on:click={(e) => {
                                    e.stopPropagation();
                                    removeFromChordBank(i);
                                }}><Icon src={mdiDelete} size="24px" /></button
                            >
                        </ChordHistoryItem>
                    </div>
                {/each}

                <!--[ ] Advance and highlight-->
            </div></Col
        >
    </Row>
</div>

<style>
</style>
