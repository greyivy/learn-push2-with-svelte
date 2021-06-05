<script lang="ts">
    import { ChordNotes } from "./ChordNotes";
    import type { Controller } from "../Controller";

    import ChordItem from "./ChordItem.svelte";
    import { Button, Field, Row, Col, Icon } from "svelte-chota";
    import {
        mdiDelete,
        mdiArrowRight,
        mdiMusicBox,
        mdiMusicBoxMultiple,
    } from "@mdi/js";

    import { fade, fly } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { chord } from "./chordStore";

    import ChordsModal from "./ChordsModal.svelte";
    import ChordProgressionsModal from "./ChordProgressionsModal.svelte";

    export let controller: Controller;

    const CHORD_HISTORY_LENGTH = 6;

    const { notesPressed } = controller;

    let chordNotes: ChordNotes;

    let currentChordPlaylistIndex: number = 0;
    let chordPlaylistAdvance: boolean = true; // TODO false
    let chordPlaylistHighlight: boolean = true;

    let chordHistoryTimeout = null;

    // toodo rename bank to playlist
    // todo rename root to scale accross the board as needed
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

    $: {
        chordNotes =
            $notesPressed.length > 1
                ? ChordNotes.fromNotes($notesPressed)
                : null;

        chord.set(chordNotes);

        if (chordNotes) {
            addToChordHistory(chordNotes);

            // Advance chordPlaylist if needed
            if (
                chordPlaylistAdvance &&
                chordPlaylist.length &&
                chordPlaylist[currentChordPlaylistIndex]?.chord.normalized ===
                    chordNotes.chord.normalized
            ) {
                // Note: ignores octaves, note order(?)
                advanceChordPlaylist();
            }
        } else {
            addToChordHistory();
        }
    }

    let chordHistory: ChordNotes[] = [];
    let chordPlaylist: ChordNotes[] = [];

    function addToChordPlaylist(...chords: ChordNotes[]) {
        for (const chord of chords) {
            chordPlaylist.push(chord);
        }

        chordPlaylist = chordPlaylist;
        setChordPlaylistIndex(0);
    }
    function removeFromChordPlaylist(index: number) {
        currentChordPlaylistIndex = 0;
        chordPlaylist.splice(index, 1);
        chordPlaylist = chordPlaylist;
        setChordPlaylistIndex(0);
    }
    function clearChordPlaylist() {
        currentChordPlaylistIndex = 0;
        chordPlaylist = [];
        setChordPlaylistIndex(0);
    }

    function setChordPlaylistIndex(index: number) {
        currentChordPlaylistIndex = index;
        document.getElementById(`chordPlaylistItem-${index}`)?.scrollIntoView({
            block: "end",
            behavior: "smooth",
        });

        if (chordPlaylistHighlight) {
            controller.highlightClear();
            if (chordPlaylist[currentChordPlaylistIndex]) {
                highlightChord(chordPlaylist[currentChordPlaylistIndex]);
            }
        }
    }

    function advanceChordPlaylist() {
        if (currentChordPlaylistIndex === chordPlaylist.length - 1) {
            setChordPlaylistIndex(0);
        } else {
            setChordPlaylistIndex(currentChordPlaylistIndex + 1);
        }
    }

    function highlightChord(chord: ChordNotes) {
        controller.highlightClear();
        controller.highlightNotes(chord.notes);
    }

    let chordsModalOpen;
    let chordProgressionsModalOpen;
</script>

<div class="chordContainerWrapper">
    <ChordsModal
        bind:open={chordsModalOpen}
        addToChordPlaylist={(...chords) => addToChordPlaylist(...chords)}
    />
    <ChordProgressionsModal
        bind:open={chordProgressionsModalOpen}
        addToChordPlaylist={(...chords) => addToChordPlaylist(...chords)}
    />

    <div class="chord">
        <h2>
            Chord: {chordNotes?.chord.name || "none"}
        </h2>
    </div>

    <div class="toolbar">
        <Field gapless>
            <Button
                icon={mdiMusicBox}
                on:click={() => {
                    chordsModalOpen = true;
                }}>Chords</Button
            >
            <Button
                icon={mdiMusicBoxMultiple}
                on:click={() => {
                    chordProgressionsModalOpen = true;
                }}>Chord progressions</Button
            >

            <Button error icon={mdiDelete} on:click={() => clearChordPlaylist()}
                >Clear</Button
            >
        </Field>
    </div>

    <Row>
        <Col>
            <h4>Chord history</h4>
        </Col>
        <Col>
            <h4>Chord playlist</h4>
        </Col>
    </Row>

    <div class="chordContainerRow">
        <Row>
            <Col>
                {#if chordHistory.length === 0}
                    <div class="text-grey">empty</div>
                {/if}
                {#each chordHistory as chord, i (chord)}
                    <div animate:flip in:fade out:fly={{ x: 100 }}>
                        <ChordItem
                            {chord}
                            on:click={(e) => {
                                e.stopPropagation();
                                highlightChord(chord);
                            }}
                        >
                            <button
                                slot="action"
                                on:click={() => addToChordPlaylist(chord)}
                                ><Icon
                                    src={mdiArrowRight}
                                    size="24px"
                                /></button
                            >
                        </ChordItem>
                    </div>
                {/each}
            </Col>

            <Col>
                {#if chordPlaylist.length === 0}
                    <div class="text-grey">empty</div>
                {/if}
                {#each chordPlaylist as chord, i (chord)}
                    <div
                        id={`chordPlaylistItem-${i}`}
                        animate:flip
                        in:fade
                        out:fly={{ x: 100 }}
                    >
                        <ChordItem
                            {chord}
                            active={i === currentChordPlaylistIndex}
                            on:click={() => setChordPlaylistIndex(i)}
                        >
                            <button
                                slot="action"
                                on:click={(e) => {
                                    e.stopPropagation();
                                    removeFromChordPlaylist(i);
                                }}><Icon src={mdiDelete} size="24px" /></button
                            >
                        </ChordItem>
                    </div>
                {/each}

                <!--[ ] Advance and highlight-->
            </Col>
        </Row>
    </div>
</div>

<style>
    .chordContainerWrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .chordContainerRow {
        flex: 1;
        min-height: 0;
    }
    .chordContainerRow :global(.row) {
        height: 100%;
    }
    .chordContainerRow :global(.col) {
        height: 100%;
        min-height: 0;
        overflow-y: scroll;
        margin-right: 0;
    }

    /* Begin scrollbar */
    .chordContainerRow :global(::-webkit-scrollbar) {
        width: 20px;
    }
    .chordContainerRow :global(::-webkit-scrollbar-thumb) {
        background: rgba(0,0,0,0.1);
        background-clip: content-box;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
    }
    .chordContainerRow :global(::-webkit-scrollbar-thumb:hover) {
        background: rgba(0,0,0,0.25);
        background-clip: content-box;
        transition: 250ms all;
    }
    .chordContainerRow :global(::-webkit-scrollbar-button) {
        display: none;
        width: 0;
        height: 0;
    }
    /* End scrollbar */

    h4 {
        margin: 0;
        margin-top: 1rem;
    }

    .chord {
        background: var(--pastel-pink);
        color: var(--text-light);
        text-align: center;
        margin-left: -2rem;
        margin-right: -2rem;
        margin-top: -1rem;
        padding: 1rem 2rem;
        display: flex;
        align-items: center;
    }
    .chord > * {
        margin: 0;
        padding: 0;
    }

    .toolbar {
        background: var(--melon);
        text-align: center;
        margin-left: -2rem;
        margin-right: -2rem;
        padding-top: 1rem;
        padding-bottom: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .toolbar :global(.message) {
        display: none;
    }
</style>
