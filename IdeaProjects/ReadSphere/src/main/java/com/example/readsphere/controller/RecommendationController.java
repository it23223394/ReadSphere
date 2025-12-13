package com.example.readsphere.controller;

import com.example.readsphere.model.Book;
import com.example.readsphere.service.recommendation.RecommendationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:3000")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/{userId}")
    public List<Book> getRecommendations(@PathVariable Long userId) {
        return recommendationService.recommendBooks(userId);
    }
}
