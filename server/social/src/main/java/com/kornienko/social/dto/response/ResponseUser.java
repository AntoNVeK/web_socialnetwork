package com.kornienko.social.dto.response;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class ResponseUser {
    private final Boolean success;
    public Boolean getSuccess() {
        return success;
    }
}
