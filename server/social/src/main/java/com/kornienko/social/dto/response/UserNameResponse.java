package com.kornienko.social.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserNameResponse {
    private boolean success;
    private String name;
    private String error;

    public static UserNameResponse success(String name) {
        return new UserNameResponse(true, name, null);
    }

    public static UserNameResponse error(String message) {
        return new UserNameResponse(false, null, message);
    }
}
