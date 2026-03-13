package com.kornienko.social.controller;


import com.kornienko.social.dto.UserUpdateDto;
import com.kornienko.social.dto.response.ApiResponse;
import com.kornienko.social.dto.response.ResponseUser;
import com.kornienko.social.dto.response.ResponseUserError;
import com.kornienko.social.dto.response.ResponseUserSuccess;
import com.kornienko.social.model.User;
import com.kornienko.social.repository.UserRepository;
import com.kornienko.social.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;


@Slf4j
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final String uploadDir = "src/main/resources/photos";

    @GetMapping("/api/users")
    public ApiResponse<List<User>> getUsers() {
        return ApiResponse.success(userService.getUsers());
    }

    @PutMapping(value = "/api/user/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> changeUser(
            @PathVariable Long id,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam(value = "middleName", required = false) String middleName,
            @RequestParam("email") String email,
            @RequestParam(value = "birthDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDate,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "isDeletePhoto", required = false) String isDeletePhoto
    ) {
        try {
            log.info("=== PUT REQUEST ===");
            log.info("User ID: {}", id);
            log.info("firstName: {}", firstName);
            log.info("lastName: {}", lastName);
            log.info("middleName: {}", middleName);
            log.info("email: {}", email);
            log.info("birthDate: {}", birthDate);
            log.info("isDeletePhoto: {}", isDeletePhoto);

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            log.info("Found user: {}", user.getEmail());

            // обновляем поля
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setMiddleName(middleName);
            user.setEmail(email);
            user.setBirthDate(birthDate);

            // если есть фото — сохраняем
            if (photo != null && !photo.isEmpty()) {
                File uploadFolder = new File(uploadDir);
                if (!uploadFolder.exists()) uploadFolder.mkdirs();

                String originalFileName = photo.getOriginalFilename();
                String extension = "";
                if (originalFileName != null && originalFileName.contains(".")) {
                    extension = originalFileName.substring(originalFileName.lastIndexOf("."));
                }

                String filename = id + "_" + System.currentTimeMillis() + extension;
                Path filePath = Paths.get(uploadDir, filename);
                Files.write(filePath, photo.getBytes());

                user.setPhoto("/photos/" + filename);
                log.info("Photo saved: {}", filename);
            } else if ("true".equals(isDeletePhoto)) {
                // если нужно удалить фото
                user.setPhoto(null);
                log.info("Photo removed");
            }

            User updatedUser = userRepository.save(user);


            return ResponseEntity.ok(ApiResponse.success(updatedUser));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Error saving file"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/api/user/{id}")
    public ResponseEntity<ResponseUser> deleteUser(@PathVariable Long id) {
        ResponseUser responseUser = userService.deleteUser(id);
        if (responseUser instanceof ResponseUserError er) {
            return ResponseEntity.badRequest().body(er);
        }
        if (responseUser instanceof ResponseUserSuccess sc) {
            return ResponseEntity.ok().body(sc);
        }
        return ResponseEntity.badRequest().body(new ResponseUser(false));
    }

    @GetMapping("/api/user/{id}/name")
    public ResponseEntity<?> getUserName(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserName(id));
    }


}
