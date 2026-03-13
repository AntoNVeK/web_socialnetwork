package com.kornienko.social.dto.response;

import com.kornienko.social.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T user;
    private String error;

    public static <T> ApiResponse<T> success(T user) {
        return new ApiResponse<>(true, user, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }

}


