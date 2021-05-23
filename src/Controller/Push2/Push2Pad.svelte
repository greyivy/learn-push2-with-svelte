<script lang="ts">
    import type { Pad } from "../../Pad";

    export let pad: Pad;

    const padPressed = pad.pressed;
    const padHighlighted = pad.highlighted;

    $: pressed = $padPressed;
    $: highlighted = $padHighlighted;
</script>

<button
    class="pad"
    class:pressed
    class:highlighted
    on:mousedown={() => pad.on()}
    on:mouseup={() => pad.off()}
>
    <span
        class="front"
        style="--pressedColor: {pad.pressedColor.html};--highlightedColor: {pad
            .highlightedColor.html}">{pad.note.name.toString()}</span
    >
</button>

<style>
    .pad {
        margin: 4px;
        background: rgba(100, 100, 100);
        border-radius: 4px;
        border: none;
        padding: 0;
        cursor: pointer;
        outline-offset: 4px;
        width: 48px;
        height: 48px;
        display: inline-block;
    }

    .front {
        transform: translateY(-4px);
        transition: transform 400ms cubic-bezier(0.3, 0.7, 0.4, 1);
        will-change: transform;

        background: rgba(200, 200, 200);
        color: #000;

        display: block;
        text-align: center;
        line-height: 48px;
        width: 48px;
        height: 48px;
        padding: 0;
        border-radius: 4px;
        font-size: 1.25rem;
    }
    .front:hover {
        transform: translateY(-6px);
        transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
    }
    .highlighted .front {
        background: var(--highlightedColor);
    }
    .pressed .front {
        transform: translateY(0px);
        transition: transform 34ms;

        background: var(--pressedColor);
    }
</style>
