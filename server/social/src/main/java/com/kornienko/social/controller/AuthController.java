package com.kornienko.social.controller;

import com.kornienko.social.model.User;
import com.kornienko.social.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user, HttpServletRequest request) {
        User savedUser = authService.register(user);
        HttpSession session = request.getSession(true);
        session.setAttribute("user", savedUser);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", savedUser);
        response.put("message", "Регистрация успешна");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = body.get("email");
        String password = body.get("password");

        return authService.login(email, password)
                .map(user -> {
                    HttpSession session = request.getSession(true);
                    session.setAttribute("user", user);

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("user", user);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "error", "Неверный email или пароль"
                )));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Выход выполнен успешно"
        ));
    }

    @GetMapping("/check")
    public ResponseEntity<?> check(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("isLoggedIn", user != null);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }
}