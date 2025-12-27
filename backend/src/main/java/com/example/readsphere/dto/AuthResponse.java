package com.example.readsphere.dto;

public class AuthResponse {
    private Long userId;
    private String token;
    private String refreshToken;
    private String message;
    private String role;

    // Constructors
    public AuthResponse() {}

    public AuthResponse(Long userId, String token, String refreshToken, String message, String role) {
        this.userId = userId;
        this.token = token;
        this.refreshToken = refreshToken;
        this.message = message;
        this.role = role;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
