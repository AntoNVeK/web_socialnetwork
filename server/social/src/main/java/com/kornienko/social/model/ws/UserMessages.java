package com.kornienko.social.model.ws;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document("messages")
public class UserMessages {

    @Id
    private String chatId; // 4_5
    private List<UserMessages.MessageItem> messages;

    @Data
    public static class MessageItem {
        private String id; // UUID
        private String senderId; // 4
        private String receiverId; // 5
        private String text;
        private LocalDateTime date;
    }
}
