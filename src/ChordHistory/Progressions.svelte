<script lang="ts">
    export let onSelect;

    const progressions = [
        {
            name: "Test progression",
            root: "C",
            progression: "IMaj7 IIm7 V7",
        },
        {
            name: "ii-V-I progression",
            root: "C",
            progression: "ii V I",
        },
    ];
</script>

<div>
    {#each progressions as progression}
        <button
            on:click={() => onSelect(progression.root, progression.progression)}
            >{progression.name}</button
        >
    {/each}
</div>

<style></style>
