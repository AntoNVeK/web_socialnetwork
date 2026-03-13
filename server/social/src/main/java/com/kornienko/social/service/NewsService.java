package com.kornienko.social.service;

import com.kornienko.social.model.ws.UserNews;
import com.kornienko.social.repository.UserNewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final UserNewsRepository userNewsRepository;

    public void addNews(String userId, String title, String content, String date) {
        UserNews userNews = userNewsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserNews newUserNews = new UserNews();
                    newUserNews.setUserId(userId);
                    newUserNews.setNews(new ArrayList<>());
                    return newUserNews;
                });

        UserNews.NewsItem newsItem = new UserNews.NewsItem();
        String id = userNews.getNews().stream()
                .map(newsItem1 -> newsItem1.getId().split("_")[1])
                .max((el1, el2) -> {
                    Long a = Long.parseLong(el1);
                    Long b = Long.parseLong(el2);
                    return a.compareTo(b);
                }).orElse("1");


        newsItem.setId("n" + userId + "_" + (Long.parseLong(id) + 1));
        newsItem.setTitle(title);
        newsItem.setContent(content);
        newsItem.setDate(date);

        userNews.getNews().add(newsItem);
        userNewsRepository.save(userNews);
    }

    public UserNews getUserNews(String userId) {
        return userNewsRepository.findByUserId(userId).orElse(null);
    }

    public void deleteNewItem(String id) {
        userNewsRepository.removeNewsItemFromUser(id.split("_")[0].replace("n",""), id);
    }

}