package com.kornienko.social.service;


import com.kornienko.social.dto.response.*;
import com.kornienko.social.model.User;
import com.kornienko.social.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public ResponseUser deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            return new ResponseUserError(false, "Пользователь с id " + id + " не найден");
        }

        userRepository.deleteById(id);
        return new ResponseUserSuccess(true, "Пользователь с id " + id + " удалён");
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public UserNameResponse getUserName(Long id) {
        var res = userRepository.findById(id);

        if (res.isPresent()) {
            return UserNameResponse.success(res.get().getFirstName());
        } else {
            return UserNameResponse.error("Нет такого пользователя");
        }
    }
}
