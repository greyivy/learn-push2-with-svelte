import type { Controller } from "../Controller"

import type { Note } from "@tonaljs/core";

export type LayoutGeneratorConfiguration = typeof LayoutGenerator & { getMeta(): LayoutGeneratorMeta, getInstance(root: Note): LayoutGenerator }

export type LayoutGeneratorMeta = {
  id: string;
  label: string;
}

export abstract class LayoutGenerator {
  readonly root: Note;

  constructor(root: Note) {
    this.root = root;
  }

  abstract generate(controller: Controller): {
    [padNumber: number]: Note
  }
}
