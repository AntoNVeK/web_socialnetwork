package com.kornienko.social.websocetchannel;

import com.kornienko.social.config.WebSocketSessionManager;
import com.kornienko.social.model.ws.UserNews;
import com.kornienko.social.repository.UserNewsRepository;
import com.kornienko.social.service.FriendsService;
import com.kornienko.social.service.NewsService;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;


import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class NewsChannel {
    private final FriendsService friendsService;
    private final NewsService newsService;
    private final UserNewsRepository userNewsRepository;
    private final WebSocketSessionManager sessions;
    private final ObjectMapper mapper = new ObjectMapper();


    public NewsChannel(FriendsService friendsService, NewsService newsService, UserNewsRepository userNewsRepository, WebSocketSessionManager sessions) {
        this.friendsService = friendsService;
        this.newsService = newsService;
        this.userNewsRepository = userNewsRepository;
        this.sessions = sessions;
    }

    public void onConnect(String userId) throws Exception {
        sendNews(userId);
    }

    public void onMessage(String userId, JsonNode message) throws Exception {

        if (message.get("type").asString().equals("add")) {

            String title = message.get("title").asString();
            String content = message.get("content").asString();
            String date = message.get("date").asString();
            // Добавляем новость
            newsService.addNews(userId, title, content, date);

            broadcast(userId);
        } else if (message.get("type").asString().equals("delete")) {
            String id = message.get("id").asString();
            newsService.deleteNewItem(id);
            broadcast(userId);
        }
    }

    private void sendNews(String userId) throws Exception {

        List<Long> friendIds = friendsService.getIdsFriendsByUserId(Long.parseLong(userId));

        List<String> allUserIds = new ArrayList<>();
        allUserIds.add(userId);
        friendIds.stream()
                .map(String::valueOf)
                .forEach(allUserIds::add);

        List<UserNews> usersNews = userNewsRepository.findByUserIds(allUserIds);



        List<UserNews.NewsItem> res = usersNews.stream()
                .flatMap((userNews -> userNews.getNews().stream()))
                .sorted((n1, n2) -> {
                    LocalDateTime d1 = LocalDateTime.parse(n1.getDate(), DateTimeFormatter.ISO_DATE_TIME);
                    LocalDateTime d2 = LocalDateTime.parse(n2.getDate(), DateTimeFormatter.ISO_DATE_TIME);
                    return d2.compareTo(d1);
                }).toList();

        Map<String, Object> feed = Map.of(
                "channel", "news",
                "feed", res
        );

        allUserIds.forEach((id) -> {
                WebSocketSession ws = sessions.get(id);

                if (ws != null && ws.isOpen()) {

                    try {
                        ws.sendMessage(new TextMessage(
                                mapper.writeValueAsString(feed)
                        ));
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
                });

    }

    private void broadcast(String userId) throws Exception {
        sendNews(userId);
    }
}