package com.kornienko.social.repository;

import com.kornienko.social.model.ws.UserNews;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.util.List;
import java.util.Optional;

public interface UserNewsRepository extends MongoRepository<UserNews, String> {
    Optional<UserNews> findByUserId(String userId);

    @Query("{ 'userId': { $in: ?0 } }")
    List<UserNews> findByUserIds(List<String> userIds);

    @Query("{ '_id' : ?0 }")
    @Update("{ '$pull' : { 'news' : { '_id' : ?1 } } }")
    void removeNewsItemFromUser(String userId, String newsItemId);
}
