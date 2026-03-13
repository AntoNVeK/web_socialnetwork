package com.kornienko.social.service;


import com.kornienko.social.model.ws.UserMessages;
import com.kornienko.social.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final MessageRepository messageRepository;



    public void addMessage(String chatId, UserMessages.MessageItem message) {

        String correctChatId = Arrays.stream(chatId.split("_"))
                .sorted().collect(Collectors.joining("_"));


        UserMessages userMessages = messageRepository.findByChatId(correctChatId)
                .orElseGet(() -> {
                    UserMessages newUserMessages = new UserMessages();
                    newUserMessages.setChatId(correctChatId);
                    newUserMessages.setMessages(new ArrayList<>());
                    return newUserMessages;
                });

        userMessages.getMessages().add(message);
        messageRepository.save(userMessages);

    }

    public List<UserMessages.MessageItem> getMessageItemsByChatId(String chatId) {
        String correctChatId = Arrays.stream(chatId.split("_"))
                .sorted().collect(Collectors.joining("_"));
        return messageRepository.findByChatId(correctChatId)
                .orElseGet(() -> {
                    UserMessages newUserMessages = new UserMessages();
                    newUserMessages.setChatId(correctChatId);
                    newUserMessages.setMessages(new ArrayList<>());
                    return newUserMessages;
                }).getMessages();

    }

    public void deleteMessage(String senderId, String receiverId, String messageId) {
        String chatId = Stream.of(senderId, receiverId).sorted().collect(Collectors.joining("_"));
        messageRepository.removeMessageByChatIdAndMessageId(chatId, messageId);
    }
}
