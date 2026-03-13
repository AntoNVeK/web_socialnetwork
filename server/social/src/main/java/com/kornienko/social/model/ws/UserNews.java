package com.kornienko.social.model.ws;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "user_news")
public class UserNews {
    @Id
    private String userId;  // "4", "5"
    private List<NewsItem> news;

    @Data
    public static class NewsItem {
        private String id;      // "n4_1"
        private String title;
        private String content;
        private String date;
    }
}
