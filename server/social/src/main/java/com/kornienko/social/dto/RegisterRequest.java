package com.kornienko.social.dto;


import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String middleName;
    private String email;
    private String password;
}
