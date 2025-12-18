package com.example.readsphere.dto;

public class UserSettingsRequest {
    private Integer readingGoalBooksPerMonth;
    private Integer readingGoalPagesPerDay;
    private String theme; // light or dark
    private Boolean notificationsEnabled;

    // Constructors
    public UserSettingsRequest() {}

    public UserSettingsRequest(Integer readingGoalBooksPerMonth, Integer readingGoalPagesPerDay, 
                              String theme, Boolean notificationsEnabled) {
        this.readingGoalBooksPerMonth = readingGoalBooksPerMonth;
        this.readingGoalPagesPerDay = readingGoalPagesPerDay;
        this.theme = theme;
        this.notificationsEnabled = notificationsEnabled;
    }

    // Getters and Setters
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
}
