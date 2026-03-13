package com.kornienko.social.config;

import com.kornienko.social.websocetchannel.ChatChannel;
import com.kornienko.social.websocetchannel.NewsChannel;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Arrays;

@Component
public class MainWebSocketHandler extends TextWebSocketHandler {

    private final WebSocketSessionManager sessionManager;
    private final NewsChannel newsChannel;
    private final ChatChannel chatChannel;

    public MainWebSocketHandler(
            WebSocketSessionManager sessionManager,
            NewsChannel newsChannel,
            ChatChannel chatChannel
    ) {
        this.sessionManager = sessionManager;
        this.newsChannel = newsChannel;
        this.chatChannel = chatChannel;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("WS CONNECTED");
        String userId = getUserId(session);
        String chatId = getChatId(session);
        sessionManager.add(chatId, session);

        if (chatId.equals("-1"))
            newsChannel.onConnect(userId);
        else
            chatChannel.onConnect(chatId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {

        String userId = getUserId(session);
        String chatId = getChatId(session);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode json = mapper.readTree(message.getPayload());



        String channel = json.get("type").asString();

        if (channel.equals("add") || channel.equals("delete")) {
            newsChannel.onMessage(userId, json);
        }

        if (channel.equals("chat") || channel.equals("deleteMessage"))  {
            chatChannel.onMessage(chatId, json);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {

        String userId = getUserId(session);
        sessionManager.remove(userId);
    }

    private String getUserId(WebSocketSession session) {

        String query = session.getUri().getQuery();
        return Arrays.stream(query.split("&"))
                .filter(p -> p.startsWith("userId="))
                .map(p -> p.split("=")[1])
                .findFirst()
                .orElse("-1")
                .split("\\?")[0];
    }
    private String getChatId(WebSocketSession session) {

        String query = session.getUri().getQuery();
        return Arrays.stream(query.split("&"))
                .filter(p -> p.startsWith("chatId="))
                .map(p -> p.split("=")[1])
                .findFirst()
                .orElse("-1")
                .split("\\?")[0];
    }

}
