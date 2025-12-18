package com.example.readsphere.dto;

public class UserSettingsResponse {
    private Long userId;
    private Integer readingGoalBooksPerMonth;
    private Integer readingGoalPagesPerDay;
    private String theme;
    private Boolean notificationsEnabled;
    private String message;

    // Constructors
    public UserSettingsResponse() {}

    public UserSettingsResponse(Long userId, Integer readingGoalBooksPerMonth, 
                               Integer readingGoalPagesPerDay, String theme, 
                               Boolean notificationsEnabled, String message) {
        this.userId = userId;
        this.readingGoalBooksPerMonth = readingGoalBooksPerMonth;
        this.readingGoalPagesPerDay = readingGoalPagesPerDay;
        this.theme = theme;
        this.notificationsEnabled = notificationsEnabled;
        this.message = message;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getReadingGoalBooksPerMonth() {
        return readingGoalBooksPerMonth;
    }

    public void setReadingGoalBooksPerMonth(Integer readingGoalBooksPerMonth) {
        this.readingGoalBooksPerMonth = readingGoalBooksPerMonth;
    }

    public Integer getReadingGoalPagesPerDay() {
        return readingGoalPagesPerDay;
    }

    public void setReadingGoalPagesPerDay(Integer readingGoalPagesPerDay) {
        this.readingGoalPagesPerDay = readingGoalPagesPerDay;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
