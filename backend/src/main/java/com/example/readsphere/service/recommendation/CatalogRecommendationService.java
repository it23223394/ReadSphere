package com.example.readsphere.service.recommendation;

import com.example.readsphere.dto.RecommendationFeedbackRequest;
import com.example.readsphere.dto.RecommendationResponse;
import com.example.readsphere.model.Book;
import com.example.readsphere.model.BookCatalog;
import com.example.readsphere.model.RecommendationFeedback;
import com.example.readsphere.model.UserBook;
import com.example.readsphere.repository.BookCatalogRepository;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.repository.RecommendationFeedbackRepository;
import com.example.readsphere.repository.UserBookRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CatalogRecommendationService {

    private static final int MAX_RESULTS = 10;

    private final BookRepository bookRepository;
    private final BookCatalogRepository catalogRepository;
    private final UserBookRepository userBookRepository;
    private final RecommendationFeedbackRepository feedbackRepository;

    public CatalogRecommendationService(BookRepository bookRepository,
                                        BookCatalogRepository catalogRepository,
                                        UserBookRepository userBookRepository,
                                        RecommendationFeedbackRepository feedbackRepository) {
        this.bookRepository = bookRepository;
        this.catalogRepository = catalogRepository;
        this.userBookRepository = userBookRepository;
        this.feedbackRepository = feedbackRepository;
    }
    
    /**
     * Normalize genre names to match catalog genres (case-insensitive, handles variations)
     */
    private String normalizeGenre(String genre) {
        if (genre == null || genre.isBlank()) {
            return null;
        }
        
        String normalized = genre.trim().toLowerCase();
        
        // Handle common variations and typos
        if (normalized.contains("psycholog") || normalized.contains("pscolog")) {
            return "Mystery"; // Map psychological thrillers to Mystery
        }
        if (normalized.contains("fantas") || normalized.contains("fanasy")) {
            return "Fantasy";
        }
        if (normalized.contains("sci-fi") || normalized.contains("science fiction")) {
            return "Sci-Fi";
        }
        if (normalized.equals("self-help") || normalized.contains("self help")) {
            return "Self-Help";
        }
        
        // Return capitalized first letter for standard genres
        return genre.substring(0, 1).toUpperCase() + genre.substring(1).toLowerCase();
    }

    public List<RecommendationResponse> recommendFromCatalog(Long userId, boolean refresh) {
        // Get user's reading history from legacy books (for genre analysis)
        List<Book> userBooks = bookRepository.findByUserId(userId);
        List<UserBook> userCatalogBooks = userBookRepository.findByUserId(userId);

        // Get IDs of books user already has
        Set<Long> userCatalogBookIds = userCatalogBooks.stream()
                .map(ub -> ub.getCatalogBook().getId())
                .collect(Collectors.toSet());

        // Analyze favorite genres with weighted scoring
        // READ/READING books get weight of 3, WANT_TO_READ gets weight of 1
        Map<String, Long> genreFrequency = new HashMap<>();
        
        // Count from legacy books (both READ and READING) - weight 3
        userBooks.stream()
                .filter(this::isReadOrReading)
                .filter(book -> book.getGenre() != null && !book.getGenre().isBlank())
                .forEach(book -> {
                    String normalized = normalizeGenre(book.getGenre());
                    if (normalized != null) {
                        genreFrequency.merge(normalized, 3L, (a, b) -> a + b);
                    }
                });
        
        // Count from catalog books with status-based weighting
        userCatalogBooks.forEach(ub -> {
            if (ub.getCatalogBook().getGenre() != null) {
                String normalized = normalizeGenre(ub.getCatalogBook().getGenre());
                if (normalized != null) {
                    long weight = isReadOrReadingStatus(ub.getStatus()) ? 3L : 1L;
                    genreFrequency.merge(normalized, weight, (a, b) -> a + b);
                }
            }
        });

        // Find highly rated books from user's library for similarity
        List<String> highlyRatedGenres = new ArrayList<>();
        
        userBooks.stream()
                .filter(this::isReadOrReading)
                .filter(book -> Optional.ofNullable(book.getRating()).orElse(0) >= 4)
                .map(Book::getGenre)
                .filter(Objects::nonNull)
                .forEach(genre -> {
                    String normalized = normalizeGenre(genre);
                    if (normalized != null) {
                        highlyRatedGenres.add(normalized);
                    }
                });
        
        userCatalogBooks.stream()
                .filter(ub -> isReadOrReadingStatus(ub.getStatus()))
                .filter(ub -> Optional.ofNullable(ub.getRating()).orElse(0) >= 4)
                .map(ub -> ub.getCatalogBook().getGenre())
                .filter(Objects::nonNull)
                .forEach(genre -> {
                    String normalized = normalizeGenre(genre);
                    if (normalized != null) {
                        highlyRatedGenres.add(normalized);
                    }
                });

        Map<Long, RecommendationResponse> recommendations = new LinkedHashMap<>();

        // RS-501: Genre-based recommendations from catalog
        if (!genreFrequency.isEmpty()) {
            List<String> topGenres = genreFrequency.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(3)
                    .map(Map.Entry::getKey)
                    .toList();

                        // Add recommendations in order of genre frequency (most frequent first)
                        for (String genre : topGenres) {
                                List<BookCatalog> genreBooks = catalogRepository.findTopRatedByGenre(genre, 4.0);
                                genreBooks.stream()
                                                .filter(book -> !userCatalogBookIds.contains(book.getId()))
                                                .limit(4)
                                                .forEach(book -> {
                                                        if (!recommendations.containsKey(book.getId())) {
                                                                recommendations.put(
                                                                                book.getId(),
                                                                                catalogToRecommendation(book, "Popular in " + genre + " (your favorite genre)", "GENRE")
                                                                );
                                                        }
                                                });
                
                                // Stop if we have enough recommendations
                                if (recommendations.size() >= MAX_RESULTS) {
                                        break;
                                }
                        }
        }

        // RS-502: Rating-based recommendations (similar to highly-rated books)
        if (!highlyRatedGenres.isEmpty()) {
            for (String genre : highlyRatedGenres) {
                List<BookCatalog> similarBooks = catalogRepository.findTopRatedByGenre(genre, 4.3);
                similarBooks.stream()
                        .filter(book -> !userCatalogBookIds.contains(book.getId()))
                        .limit(3)
                        .forEach(book -> recommendations.putIfAbsent(
                                book.getId(),
                                catalogToRecommendation(
                                        book,
                                        "Because you loved books in " + genre,
                                        "RATING"
                                )
                        ));
            }
        }

        // Fallback: Top rated books from catalog
        if (recommendations.isEmpty()) {
            List<BookCatalog> topRated = catalogRepository.findTopRated(4.5);
            topRated.stream()
                    .filter(book -> !userCatalogBookIds.contains(book.getId()))
                    .limit(MAX_RESULTS)
                    .forEach(book -> recommendations.putIfAbsent(
                            book.getId(),
                            catalogToRecommendation(book, "Highly rated across all readers", "POPULAR")
                    ));
        }

        List<RecommendationResponse> result = recommendations.values().stream()
                .limit(MAX_RESULTS)
                .toList();

        if (refresh && result.size() > 1) {
            result = result.stream()
                    .sorted((a, b) -> Double.compare(Math.random(), 0.5))
                    .toList();
        }

        return result;
    }

    public RecommendationFeedback submitFeedback(Long userId, Long catalogBookId, RecommendationFeedbackRequest payload) {
        String feedback = Optional.ofNullable(payload.getFeedback())
                .map(String::trim)
                .map(String::toUpperCase)
                .orElse("");

        if (!feedback.equals("UP") && !feedback.equals("DOWN")) {
            throw new IllegalArgumentException("Feedback must be 'UP' or 'DOWN'");
        }

        catalogRepository.findById(catalogBookId)
                .orElseThrow(() -> new IllegalArgumentException("Catalog book not found"));

        RecommendationFeedback record = new RecommendationFeedback(userId, catalogBookId, feedback);
        return feedbackRepository.save(record);
    }

    private RecommendationResponse catalogToRecommendation(BookCatalog book, String reason, String strategy) {
        return new RecommendationResponse(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getGenre(),
                book.getDescription(),
                book.getAverageRating() != null ? book.getAverageRating().intValue() : null,
                book.getCoverUrl(),
                null, // No status for catalog books
                book.getTotalPages(),
                0,    // No pages read
                reason,
                strategy
        );
    }

    private boolean isRead(Book book) {
        return book != null && book.getStatus() != null && "READ".equalsIgnoreCase(book.getStatus());
    }

    private boolean isReadOrReading(Book book) {
        if (book == null || book.getStatus() == null) return false;
        String status = book.getStatus().toUpperCase();
        return status.equals("READ") || status.equals("READING");
    }

    private boolean isReadOrReadingStatus(String status) {
        if (status == null) return false;
        String upperStatus = status.toUpperCase();
        return upperStatus.equals("READ") || upperStatus.equals("READING");
    }
}
