package com.example.readsphere.controller;

import com.example.readsphere.dto.UpdateProfileRequest;
import com.example.readsphere.dto.UserProfileResponse;
import com.example.readsphere.dto.ChangePasswordRequest;
import com.example.readsphere.dto.UserSettingsRequest;
import com.example.readsphere.dto.UserSettingsResponse;
import com.example.readsphere.service.UserService;
import com.example.readsphere.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Extract user ID from JWT token in Authorization header
     */
    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    /**
     * RS-103: Get user profile
     * GET /api/users/profile
     * Headers: Authorization: Bearer <token>
     * Response: { id, name, email, message }
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            UserProfileResponse response = userService.getUserProfile(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * RS-103: Update user profile
     * PUT /api/users/profile
     * Headers: Authorization: Bearer <token>
     * Request body: { name, email }
     * Response: { id, name, email, message }
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateProfileRequest request) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            UserProfileResponse response = userService.updateUserProfile(userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * RS-103: Change password
     * PUT /api/users/change-password
     * Headers: Authorization: Bearer <token>
     * Request body: { oldPassword, newPassword, confirmPassword }
     * Response: { id, name, email, message }
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChangePasswordRequest request) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            UserProfileResponse response = userService.changePassword(userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * RS-105: Resend email verification
     * POST /api/users/resend-verification
     * Headers: Authorization: Bearer <token>
     * Response: { message }
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            Map<String, String> response = userService.sendEmailVerification(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send verification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * RS-106: Get user settings
     * GET /api/users/settings
     * Headers: Authorization: Bearer <token>
     * Response: { userId, readingGoalBooksPerMonth, readingGoalPagesPerDay, theme, notificationsEnabled, message }
     */
    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            UserSettingsResponse response = userService.getUserSettings(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * RS-106: Update user settings
     * PUT /api/users/settings
     * Headers: Authorization: Bearer <token>
     * Request body: { readingGoalBooksPerMonth, readingGoalPagesPerDay, theme, notificationsEnabled }
     * Response: { userId, readingGoalBooksPerMonth, readingGoalPagesPerDay, theme, notificationsEnabled, message }
     */
    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UserSettingsRequest request) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            UserSettingsResponse response = userService.updateUserSettings(userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update settings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
