package com.kornienko.social.controller;


import com.kornienko.social.dto.response.ResponseOperationFriendSuccess;
import com.kornienko.social.dto.response.ResponseFindFriends;
import com.kornienko.social.service.FriendsService;
import com.kornienko.social.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class FriendshipController {
    private final UserService userService;
    private final FriendsService friendsService;
    @GetMapping("api/user/{id}/friends")
    public ResponseEntity<ResponseFindFriends> getFriends(@PathVariable Long id) {
        List<Long> list = friendsService.getIdsFriendsByUserId(id);

        ResponseFindFriends response = new ResponseFindFriends(!list.isEmpty(), list);
        log.info("Response: success={}, friends={}", response.isSuccess(), response.getFriends());
        log.info("Response status: {}", HttpStatus.OK);
        log.info("==========================");

        return ResponseEntity.ok(response);
    }

    @PostMapping("api/user/{id}/friends")
    public ResponseEntity<ResponseOperationFriendSuccess> addFriend(
            @PathVariable Long id,
            @RequestBody Long friendId
    ) {
        log.info("userId {}, friendId: {}", id, friendId);
        friendsService.addFriend(id, friendId);
        return ResponseEntity.ok(new ResponseOperationFriendSuccess(true, "Друг успешно добавлен", friendsService.getIdsFriendsByUserId(id)));
    }

    @DeleteMapping("api/user/{id}/friends/{friendId}")
    public ResponseEntity<?> removeFriendShip(
            @PathVariable Long id,
            @PathVariable Long friendId
    ) {
        friendsService.deleteFriendShip(id, friendId);
        return ResponseEntity.ok(new ResponseOperationFriendSuccess(true, "Друг успешно удалён", friendsService.getIdsFriendsByUserId(id)));
    }
}
