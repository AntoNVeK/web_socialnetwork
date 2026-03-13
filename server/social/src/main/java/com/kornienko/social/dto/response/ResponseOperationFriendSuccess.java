package com.kornienko.social.dto.response;

import java.util.List;

public class ResponseOperationFriendSuccess extends ResponseUserSuccess{
    private final List<Long> friends;
    public ResponseOperationFriendSuccess(Boolean success, String message, List<Long> friends) {
        super(success, message);
        this.friends = friends;
    }
    public List<Long> getFriends() {
        return friends;
    }
    @Override
    public String toString() {
        return "ResponseAddFriendSuccess{" +
                "friends=" + friends +
                '}';
    }
}
