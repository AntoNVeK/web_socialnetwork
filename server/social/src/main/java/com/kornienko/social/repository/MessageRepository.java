package com.kornienko.social.repository;

import com.kornienko.social.model.ws.UserMessages;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;

public interface MessageRepository extends MongoRepository<UserMessages, String> {
    Optional<UserMessages> findByChatId(String chatId);

    @Query("{ '_id': ?0 }")
    @Update("{ '$pull': { 'messages':  { '_id' : ?1 } } }")
    void removeMessageByChatIdAndMessageId(String chatId, String messageId);
}
