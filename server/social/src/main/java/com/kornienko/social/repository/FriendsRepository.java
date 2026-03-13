package com.kornienko.social.repository;


import com.kornienko.social.model.Friendship;
import com.kornienko.social.model.FriendshipId;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FriendsRepository extends JpaRepository<Friendship, FriendshipId> {

    @Query("""
            SELECT f FROM Friendship f WHERE f.id.firstFriendId = :userId OR f.id.secondFriendId = :userId
            """)
    List<Friendship> findAllFriendshipsByUserId(@Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query("""
            DELETE FROM Friendship f WHERE (f.id.firstFriendId = :userId AND f.id.secondFriendId = :friendId) OR (f.id.firstFriendId = :friendId AND f.id.secondFriendId = :userId)
            """)
    void deleteNotDependsByOrder(@Param("userId") Long userId, @Param("friendId") Long friendId);

}
