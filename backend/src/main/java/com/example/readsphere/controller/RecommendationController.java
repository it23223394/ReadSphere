package com.example.readsphere.controller;

import com.example.readsphere.dto.RecommendationFeedbackRequest;
import com.example.readsphere.dto.RecommendationResponse;
import com.example.readsphere.model.RecommendationFeedback;
import com.example.readsphere.service.recommendation.CatalogRecommendationService;
import com.example.readsphere.service.recommendation.RecommendationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:3000")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final CatalogRecommendationService catalogRecommendationService;

    public RecommendationController(RecommendationService recommendationService,
                                    CatalogRecommendationService catalogRecommendationService) {
        this.recommendationService = recommendationService;
        this.catalogRecommendationService = catalogRecommendationService;
    }

    @GetMapping("/{userId}")
    public List<RecommendationResponse> getRecommendations(@PathVariable Long userId,
                                                           @RequestParam(value = "refresh", defaultValue = "false") boolean refresh,
                                                           @RequestParam(value = "source", defaultValue = "catalog") String source) {
        if ("catalog".equalsIgnoreCase(source)) {
            return catalogRecommendationService.recommendFromCatalog(userId, refresh);
        } else {
            return recommendationService.recommendBooks(userId, refresh);
        }
    }

    @PostMapping("/{userId}/{bookId}/feedback")
    public RecommendationFeedback submitFeedback(@PathVariable Long userId,
                                                 @PathVariable Long bookId,
                                                 @RequestBody RecommendationFeedbackRequest request) {
        return catalogRecommendationService.submitFeedback(userId, bookId, request);
    }
}
