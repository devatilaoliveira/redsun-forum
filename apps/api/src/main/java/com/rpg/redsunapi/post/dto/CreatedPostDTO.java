package com.rpg.redsunapi.post.dto;

import com.rpg.redsunapi.post.Post;
import com.rpg.redsunapi.tale.Tale;

public record CreatedPostDTO(Post post, Tale tale) {
}
