<script lang="ts">
    // TODO custom chords in various notations
    // TODO chord preview/info popover

    import { all } from "@tonaljs/chord-type";
    import type { ChordType } from "@tonaljs/chord-type";

    import Fuse from "fuse.js";

    import { Button, Card, Field, Modal, Tag } from "svelte-chota";
    import { rootLetter, rootOctave } from "../configurationStore";

    import { NOTES, OCTAVES } from "../helpers";
    import { mdiPlus } from "@mdi/js";
    import { ChordNotes } from "./ChordNotes";

    interface ExtendedChordType extends ChordType {
        fullName: string;
    }

    const chordTypes: ExtendedChordType[] = all().map((c) => ({
        ...c,
        fullName: c.name
            ? `${c.name} (${c.aliases.join(", ")})`
            : c.aliases.join(", "),
    }));
    const chordQualities = [...new Set(chordTypes.map((c) => c.quality))];

    export let open: boolean;
    export let addToChordPlaylist: (...chords: ChordNotes[]) => void;

    let selectedTonicLetter: string;
    let selectedOctave: number;

    let filterSearchElement: HTMLElement;
    let filterSearch: string = "";
    let filterQuality: string = null;

    let tableContainerElement: HTMLElement;

    let filteredChordTypes: ExtendedChordType[];
    $: {
        filteredChordTypes = chordTypes;

        // Filter by quality
        if (filterQuality) {
            filteredChordTypes = filteredChordTypes.filter(
                (c) => c.quality === filterQuality
            );
        }

        // Search by name/aliases
        if (filterSearch && filterSearch.length) {
            const fuse = new Fuse(filteredChordTypes, {
                keys: [
                    { name: "name", weight: 0.4 },
                    { name: "aliases", weight: 0.6 },
                ],
            });
            filteredChordTypes = fuse.search(filterSearch).map((c) => c.item);
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

    function addItemToChordPlaylist(chordType: ChordType) {
        {
            const chordNotes = ChordNotes.fromChordType(
                chordType,
                selectedTonicLetter || $rootLetter,
                selectedOctave || $rootOctave + 1
            );

            addToChordPlaylist(chordNotes);
        }
    }
</script>

<Modal bind:open style="width: 80vw; height: 80vh; max-width: 800px;">
    <Card style="display: flex; flex-direction: column;">
        <h4 slot="header">Chords</h4>

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
                <Field label="Name/quality" grouped>
                    <input
                        bind:value={filterSearch}
                        bind:this={filterSearchElement}
                        on:keypress={(e) => {
                            // Add first item in list
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (filteredChordTypes[0]) {
                                    open = false;
                                    addItemToChordPlaylist(
                                        filteredChordTypes[0]
                                    );
                                }
                            }
                        }}
                        autocomplete="off"
                        autocapitalize="off"
                    />
                    <select bind:value={filterQuality}>
                        <option value={null}> Any </option>
                        {#each chordQualities as chordQuality}
                            <option value={chordQuality}>
                                {chordQuality}
                            </option>
                        {/each}
                    </select>
                </Field>
            </fieldset>
        </div>

        <div class="tableContainer" bind:this={tableContainerElement}>
            <table class="striped">
                <thead>
                    <tr>
                        <th> Name </th>
                        <th> Quality </th>
                        <th>{" "}</th>
                    </tr>
                </thead>
                {#each filteredChordTypes as chordType}
                    <tr>
                        <td>
                            {chordType.fullName}
                        </td>
                        <td>
                            <Tag small>{chordType.quality}</Tag>
                        </td>
                        <td class="buttonColumn">
                            <Button
                                primary
                                title="Add to chord playlist"
                                icon={mdiPlus}
                                on:click={() =>
                                    addItemToChordPlaylist(chordType)}
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
