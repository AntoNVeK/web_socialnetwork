package com.kornienko.social.config;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketSessionManager {

    private final Map<String, WebSocketSession> clients = new ConcurrentHashMap<>();

    public void add(String userId, WebSocketSession session) {
        clients.put(userId, session);
    }

    public void remove(String userId) {
        clients.remove(userId);
    }

    public WebSocketSession get(String userId) {
        return clients.get(userId);
    }

    public Map<String, WebSocketSession> getClients() {
        return clients;
    }
}
