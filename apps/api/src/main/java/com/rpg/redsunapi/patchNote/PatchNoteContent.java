package com.rpg.redsunapi.patchNote;

import java.util.List;

public record PatchNoteContent(String title, String summary, List<PatchNoteItem> items) {
}
