package com.kornienko.social.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "friendship")
public class Friendship {

    @EmbeddedId
    private FriendshipId id;

    public Friendship() {}

    public Friendship(Long firstFriendId, Long secondFriendId) {
        this.id = new FriendshipId(firstFriendId, secondFriendId);
    }

    public FriendshipId getId() {
        return id;
    }

    public void setId(FriendshipId id) {
        this.id = id;
    }

    public Long getFirstFriendId() {
        return id != null ? id.getFirstFriendId() : null;
    }

    public Long getSecondFriendId() {
        return id != null ? id.getSecondFriendId() : null;
    }

    public void setFirstFriendId(Long firstFriendId) {
        if (id == null) {
            id = new FriendshipId();
        }
        id.setFirstFriendId(firstFriendId);
    }

    public void setSecondFriendId(Long secondFriendId) {
        if (id == null) {
            id = new FriendshipId();
        }
        id.setSecondFriendId(secondFriendId);
    }
}
