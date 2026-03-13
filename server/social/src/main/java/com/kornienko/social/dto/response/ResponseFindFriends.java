package com.kornienko.social.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@AllArgsConstructor
public class ResponseFindFriends {

    private final Boolean success;
    @Getter
    private final List<Long> friends;

    public Boolean isSuccess() {
        return success;
    }

}
