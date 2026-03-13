package com.kornienko.social.websocetchannel;

import com.kornienko.social.config.WebSocketSessionManager;
import com.kornienko.social.dto.DeleteMessageDto;
import com.kornienko.social.model.ws.UserMessages;
import com.kornienko.social.repository.MessageRepository;
import com.kornienko.social.service.ChatService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class ChatChannel {

    private final ChatService chatService;
    private final MessageRepository repo;
    private final WebSocketSessionManager sessions;
    private final ObjectMapper mapper = new ObjectMapper();

    public ChatChannel(ChatService chatService, MessageRepository repo, WebSocketSessionManager sessions) {
        this.chatService = chatService;
        this.repo = repo;
        this.sessions = sessions;
    }

    public void onConnect(String chatId) throws Exception{
        sendMessages(chatId);
    }

    private void sendMessages(String chatId) throws Exception{

        String secondConnectionId = String.join("_", Arrays.asList(chatId.split("_")).reversed());

        List<UserMessages.MessageItem> messageItemList = chatService.getMessageItemsByChatId(chatId);

        sendManyMessages(chatId, messageItemList);
        sendManyMessages(secondConnectionId, messageItemList);
    }

    public void onMessage(String chatId, JsonNode message) throws Exception {

        if (message.get("type").asString().equals("chat")) {

            UserMessages.MessageItem msg = new UserMessages.MessageItem();

            msg.setSenderId(message.get("senderId").asString());
            msg.setReceiverId(message.get("receiverId").asString());
            msg.setText(message.get("text").asString());
            msg.setDate(LocalDateTime.parse(message.get("date").asString(), DateTimeFormatter.ISO_DATE_TIME));
            msg.setId(UUID.randomUUID().toString());
            chatService.addMessage(chatId, msg);

            String firstUserConnectionId = msg.getSenderId() + "_" + msg.getReceiverId();
            String secondUserConnectionId = msg.getReceiverId() + "_" + msg.getSenderId();



            sendOneMessage(firstUserConnectionId, msg);
            sendOneMessage(secondUserConnectionId, msg);

        } else if (message.get("type").asString().equals("deleteMessage")) {

            String senderId = message.get("senderId").asString();
            String receiverId = message.get("receiverId").asString();
            String date = message.get("date").asString();
            LocalDateTime dateTime = LocalDateTime.parse(date, DateTimeFormatter.ISO_DATE_TIME);
            String id = message.get("id").asString();
            String firstUserConnectionId = senderId + "_" + receiverId;
            String secondUserConnectionId = receiverId + "_" + senderId;

            chatService.deleteMessage(senderId, receiverId, id);

            sendToDeleteMessage(firstUserConnectionId,senderId,receiverId, dateTime);
            sendToDeleteMessage(secondUserConnectionId,senderId,receiverId, dateTime);
        }
    }

    private void sendToDeleteMessage(String chatId, String senderId, String receiverId, LocalDateTime date) throws Exception {

        WebSocketSession ws = sessions.get(chatId);

        DeleteMessageDto deleteMessageDto = new DeleteMessageDto();
        deleteMessageDto.setSenderId(senderId);
        deleteMessageDto.setReceiverId(receiverId);
        deleteMessageDto.setDate(date);

        Map<String, Object> res = Map.of(
                "channel", "deletemessage",
                "message", deleteMessageDto
        );


        if (ws != null && ws.isOpen()) {

            ws.sendMessage(
                    new TextMessage(mapper.writeValueAsString(res))
            );
        }
        else {
            System.out.println("Нет пользователя в сети с chatId: " + chatId);
        }

    }

    private void sendOneMessage(String chatId, UserMessages.MessageItem msg) throws Exception {

        WebSocketSession ws = sessions.get(chatId);

        Map<String, Object> res = Map.of(
                "channel", "chat",
                "message", msg
        );

        if (ws != null && ws.isOpen()) {

            ws.sendMessage(
                    new TextMessage(mapper.writeValueAsString(res))
            );
        }
        else {
            System.out.println("Нет пользователя в сети с chatId: " + chatId);
        }
    }

    private void sendManyMessages(String chatId, List<UserMessages.MessageItem> list) throws Exception {
        Map<String, Object> res = Map.of(
                "channel", "chat",
                "messages", list,
                "chatId", chatId
        );

        WebSocketSession ws = sessions.get(chatId);

        if (ws != null && ws.isOpen()) {
            ws.sendMessage(
                    new TextMessage(mapper.writeValueAsString(res))
            );
        }
        else {
            System.out.println("Нет пользователя в сети с chatId: " + chatId);
        }
    }

}
