package com.kornienko.social.dto.response;



public class ResponseUserSuccess extends ResponseUser{
    private final String message;
    public ResponseUserSuccess(Boolean success, String message) {
        super(success);
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
