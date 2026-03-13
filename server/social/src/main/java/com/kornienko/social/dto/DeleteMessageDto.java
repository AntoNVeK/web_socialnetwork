package com.kornienko.social.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DeleteMessageDto {
    private String senderId;
    private String receiverId;
    private LocalDateTime date;
}
