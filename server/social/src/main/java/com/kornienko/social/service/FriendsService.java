package com.kornienko.social.service;

import com.kornienko.social.model.Friendship;
import com.kornienko.social.repository.FriendsRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendsService {
    private final FriendsRepository friendsRepository;

    @Transactional
    public List<Long> getIdsFriendsByUserId(Long id) {
        List<Friendship> list = friendsRepository.findAllFriendshipsByUserId(id);
        return list.stream()
                .map((friendship -> {
                    if (id.equals(friendship.getFirstFriendId()))
                        return friendship.getSecondFriendId();
                    else if (id.equals(friendship.getSecondFriendId()))
                        return friendship.getFirstFriendId();
                    return (long) -1;
                })).toList();
    }

    public void addFriend(Long currentUserId, Long id) {
        friendsRepository.save(new Friendship(currentUserId, id));
    }

    public void deleteFriendShip(Long id, Long friendId) {
        friendsRepository.deleteNotDependsByOrder(id, friendId);
    }
}
