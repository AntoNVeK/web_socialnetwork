package com.kornienko.social.dto.response;



public class ResponseUserError extends ResponseUser {
    private final String error;
    public ResponseUserError(Boolean success, String error) {
        super(success);
        this.error = error;
    }
}
