export interface PatchNoteItemDTO {
  readonly title: string;
  readonly description: string;
}

export interface PatchNoteDTO {
  readonly id: string;
  readonly releaseDate: string;
  readonly title: string;
  readonly summary: string;
  readonly items: readonly PatchNoteItemDTO[];
}
