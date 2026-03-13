package com.kornienko.social.model;

import jakarta.persistence.*;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class FriendshipId implements Serializable {

    @Serial
    private static final long serialVersionUID = 1234342L;

    @Column(name = "first_friend_id")
    private Long firstFriendId;

    @Column(name = "second_friend_id")
    private Long secondFriendId;



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FriendshipId that = (FriendshipId) o;
        return Objects.equals(firstFriendId, that.firstFriendId) &&
                Objects.equals(secondFriendId, that.secondFriendId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(firstFriendId, secondFriendId);
    }
}
