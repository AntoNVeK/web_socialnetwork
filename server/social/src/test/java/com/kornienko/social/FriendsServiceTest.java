package com.kornienko.social;

import com.kornienko.social.model.Friendship;
import com.kornienko.social.repository.FriendsRepository;
import com.kornienko.social.service.FriendsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FriendsService Unit Tests")
class FriendsServiceTest {

    @Mock
    private FriendsRepository friendsRepository;

    @InjectMocks
    private FriendsService friendsService;

    private Long userId;
    private Long friendId1;
    private Long friendId2;

    @BeforeEach
    void setUp() {
        userId = 1L;
        friendId1 = 2L;
        friendId2 = 3L;
    }

    @Test
    @DisplayName("Should return list of friend IDs for user when user is first friend")
    void getIdsFriendsByUserId_WhenUserIsFirstFriend_ShouldReturnSecondFriendIds() {
        // given
        Friendship friendship1 = new Friendship(userId, friendId1);
        Friendship friendship2 = new Friendship(userId, friendId2);
        List<Friendship> friendships = List.of(friendship1, friendship2);

        when(friendsRepository.findAllFriendshipsByUserId(userId)).thenReturn(friendships);

        // when
        List<Long> result = friendsService.getIdsFriendsByUserId(userId);

        // then
        assertThat(result).containsExactly(friendId1, friendId2);
        verify(friendsRepository).findAllFriendshipsByUserId(userId);
    }

    @Test
    @DisplayName("Should return list of friend IDs for user when user is second friend")
    void getIdsFriendsByUserId_WhenUserIsSecondFriend_ShouldReturnFirstFriendIds() {
        // given
        Friendship friendship1 = new Friendship(friendId1, userId);
        Friendship friendship2 = new Friendship(friendId2, userId);
        List<Friendship> friendships = List.of(friendship1, friendship2);

        when(friendsRepository.findAllFriendshipsByUserId(userId)).thenReturn(friendships);

        // when
        List<Long> result = friendsService.getIdsFriendsByUserId(userId);

        // then
        assertThat(result).containsExactly(friendId1, friendId2);
        verify(friendsRepository).findAllFriendshipsByUserId(userId);
    }

    @Test
    @DisplayName("Should return empty list when user has no friends")
    void getIdsFriendsByUserId_WhenNoFriends_ShouldReturnEmptyList() {
        // given
        when(friendsRepository.findAllFriendshipsByUserId(userId)).thenReturn(List.of());

        // when
        List<Long> result = friendsService.getIdsFriendsByUserId(userId);

        // then
        assertThat(result).isEmpty();
        verify(friendsRepository).findAllFriendshipsByUserId(userId);
    }

    @Test
    @DisplayName("Should handle mixed friendships where user is sometimes first, sometimes second")
    void getIdsFriendsByUserId_WithMixedFriendships_ShouldReturnAllFriendIds() {
        // given
        Friendship friendship1 = new Friendship(userId, friendId1);      // user is first
        Friendship friendship2 = new Friendship(friendId2, userId);      // user is second
        List<Friendship> friendships = List.of(friendship1, friendship2);

        when(friendsRepository.findAllFriendshipsByUserId(userId)).thenReturn(friendships);

        // when
        List<Long> result = friendsService.getIdsFriendsByUserId(userId);

        // then
        assertThat(result).containsExactlyInAnyOrder(friendId1, friendId2);
    }

    @Test
    @DisplayName("Should save friendship when adding a friend")
    void addFriend_ShouldSaveFriendship() {
        // given
        Long currentUserId = 1L;
        Long newFriendId = 2L;
        Friendship expectedFriendship = new Friendship(currentUserId, newFriendId);

        // when
        friendsService.addFriend(currentUserId, newFriendId);

        // then
        verify(friendsRepository).save(argThat(friendship ->
                friendship.getFirstFriendId().equals(currentUserId) &&
                        friendship.getSecondFriendId().equals(newFriendId)
        ));
    }

    @Test
    @DisplayName("Should delete friendship when removing a friend")
    void deleteFriendShip_ShouldCallRepositoryDeleteMethod() {
        // given
        Long userId = 1L;
        Long friendId = 2L;

        // when
        friendsService.deleteFriendShip(userId, friendId);

        // then
        verify(friendsRepository).deleteNotDependsByOrder(userId, friendId);
    }
}
