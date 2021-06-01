import type { Writable } from "svelte/store";
import { writable } from 'svelte/store'
import type { ChordNotes } from "./chordUtils";

export const chord: Writable<ChordNotes> = writable(null);