<script lang="ts">
    import Fuse from "fuse.js";

    import { Button, Card, Field, Modal } from "svelte-chota";
    import { rootLetter, rootOctave } from "../configurationStore";

    import { NOTES, OCTAVES } from "../helpers";
    import { mdiPlus } from "@mdi/js";
    import { ChordNotes } from "./ChordNotes";
    import { chordProgressionEntries } from "./ChordProgressionEntry";
    import type { ChordProgressionEntry } from "./ChordProgressionEntry";
    
    // TODO move chord playlist to store so we can use it on the display

    export let open: boolean;
    export let addToChordPlaylist: (...chords: ChordNotes[]) => void;

    let selectedTonicLetter: string;
    let selectedOctave: number;

    let filterSearchElement: HTMLElement;
    let filterSearch: string = "";
    // let filterQuality: string = null;

    let tableContainerElement: HTMLElement;

    let filteredChordProgressionEntries: ChordProgressionEntry[];
    $: {
        filteredChordProgressionEntries = chordProgressionEntries;

        // Filter by quality
        /* if (filterQuality) {
            filteredChordTypes = filteredChordTypes.filter(
                (c) => c.quality === filterQuality
            );
        } */

        // Search by name
        if (filterSearch && filterSearch.length) {
            const fuse = new Fuse(filteredChordProgressionEntries, {
                keys: ["name"],
            });
            filteredChordProgressionEntries = fuse
                .search(filterSearch)
                .map((c) => c.item);
        }

        // Scroll to top after search
        if (tableContainerElement) {
            tableContainerElement.scrollTop = 0;
        }
    }

    $: {
        // Focus search box when modal is opened
        open && filterSearchElement?.focus();
    }

    function addItemToChordPlaylist(chordProgression: string[]) {
        const chordProgressionChordNotes = ChordNotes.fromProgression(
            chordProgression,
            selectedTonicLetter || $rootLetter,
            selectedOctave || $rootOctave + 1
        );

        addToChordPlaylist(...chordProgressionChordNotes);
    }

    function promptChordProgression() {
        const chordProgression = window.prompt(
            "Enter chord progression in interval notation:"
        );

        const chordProgressionSplit = chordProgression.split(/[\s-]/);

        try {
            addItemToChordPlaylist(chordProgressionSplit);
            open = false;
        } catch (e) {
            window.alert(e.message);
        }
    }
</script>

<Modal bind:open style="width: 80vw; height: 80vh; max-width: 800px;">
    <Card style="display: flex; flex-direction: column;">
        <h4 slot="header">Chord progressions</h4>

        <div class="formContainer">
            <fieldset>
                <legend>Parameters</legend>
                <Field label="Tonic/octave" grouped>
                    <select bind:value={selectedTonicLetter}>
                        <option value={undefined}> Current </option>
                        {#each NOTES as note}
                            <option value={note}>
                                {note}
                            </option>
                        {/each}
                    </select>
                    <select bind:value={selectedOctave}>
                        <option value={undefined}> Auto </option>
                        {#each OCTAVES as octave}
                            <option value={octave}>
                                {octave}
                            </option>
                        {/each}
                    </select>
                </Field>
            </fieldset>

            <fieldset>
                <legend>Search</legend>
                <Field label="Name">
                    <input
                        bind:value={filterSearch}
                        bind:this={filterSearchElement}
                        on:keypress={(e) => {
                            // Add first item in list
                            if (e.key === "Enter") {
                                e.preventDefault();
                                if (filteredChordProgressionEntries[0]) {
                                    open = false;
                                    addItemToChordPlaylist(
                                        filteredChordProgressionEntries[0]
                                            .progression
                                    );
                                }
                            }
                        }}
                        autocomplete="off"
                        autocapitalize="off"
                    />
                </Field>
            </fieldset>
        </div>

        <div class="tableContainer" bind:this={tableContainerElement}>
            <table class="striped">
                <thead>
                    <tr>
                        <th> Name </th>
                        <th class="buttonColumn">
                            <Button
                                primary
                                outline
                                icon={mdiPlus}
                                on:click={() => promptChordProgression()}
                                >Custom</Button
                            ></th
                        >
                    </tr>
                </thead>
                {#each filteredChordProgressionEntries as chordProgressionEntry}
                    <tr>
                        <td>
                            {chordProgressionEntry.name}
                        </td>
                        <td class="buttonColumn">
                            <Button
                                primary
                                title="Add to chord playlist"
                                icon={mdiPlus}
                                on:click={() =>
                                    addItemToChordPlaylist(
                                        chordProgressionEntry.progression
                                    )}
                            />
                        </td>
                    </tr>
                {/each}
            </table>
        </div>

        <div slot="footer" class="is-right">
            <Button
                clear
                on:click={() => {
                    open = false;
                }}>Close</Button
            >
        </div>
    </Card>
</Modal>

<style>
    .tableContainer {
        overflow: auto;
        flex: 1;
    }
    .tableContainer thead th {
        position: sticky;
        top: 0;
        background: rgba(255, 255, 255, 0.8);
        z-index: 1;
    }

    .formContainer fieldset {
        margin-bottom: 1rem;
    }
    .formContainer :global(.message) {
        display: none;
    }

    .buttonColumn {
        text-align: right;
    }
    .buttonColumn :global(button) {
        margin: 0;
    }
</style>
