package com.example.readsphere.dto;

public class RecommendationFeedbackRequest {
    private String feedback; // Expected: "UP" or "DOWN"

    public RecommendationFeedbackRequest() {
    }

    public RecommendationFeedbackRequest(String feedback) {
        this.feedback = feedback;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
