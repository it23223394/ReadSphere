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

    public List<RecommendationResponse> recommendFromCatalog(Long userId, boolean refresh) {
        // Get user's reading history from legacy books (for genre analysis)
        List<Book> userBooks = bookRepository.findByUserId(userId);
        List<UserBook> userCatalogBooks = userBookRepository.findByUserId(userId);

        // Get IDs of books user already has
        Set<Long> userCatalogBookIds = userCatalogBooks.stream()
                .map(ub -> ub.getCatalogBook().getId())
                .collect(Collectors.toSet());

        // Analyze favorite genres from READ books
        Map<String, Long> genreFrequency = new HashMap<>();
        
        // Count from legacy books
        userBooks.stream()
                .filter(this::isRead)
                .filter(book -> book.getGenre() != null && !book.getGenre().isBlank())
                .forEach(book -> genreFrequency.merge(book.getGenre(), 1L, Long::sum));
        
        // Count from catalog books
        userCatalogBooks.stream()
                .filter(ub -> "READ".equalsIgnoreCase(ub.getStatus()))
                .map(ub -> ub.getCatalogBook().getGenre())
                .filter(Objects::nonNull)
                .forEach(genre -> genreFrequency.merge(genre, 1L, Long::sum));

        // Find highly rated books from user's library for similarity
        List<String> highlyRatedGenres = new ArrayList<>();
        
        userBooks.stream()
                .filter(this::isRead)
                .filter(book -> Optional.ofNullable(book.getRating()).orElse(0) >= 4)
                .map(Book::getGenre)
                .filter(Objects::nonNull)
                .forEach(highlyRatedGenres::add);
        
        userCatalogBooks.stream()
                .filter(ub -> "READ".equalsIgnoreCase(ub.getStatus()))
                .filter(ub -> Optional.ofNullable(ub.getRating()).orElse(0) >= 4)
                .map(ub -> ub.getCatalogBook().getGenre())
                .filter(Objects::nonNull)
                .forEach(highlyRatedGenres::add);

        Map<Long, RecommendationResponse> recommendations = new LinkedHashMap<>();

        // RS-501: Genre-based recommendations from catalog
        if (!genreFrequency.isEmpty()) {
            List<String> topGenres = genreFrequency.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(3)
                    .map(Map.Entry::getKey)
                    .toList();

            for (String genre : topGenres) {
                List<BookCatalog> genreBooks = catalogRepository.findTopRatedByGenre(genre, 4.0);
                genreBooks.stream()
                        .filter(book -> !userCatalogBookIds.contains(book.getId()))
                        .limit(5)
                        .forEach(book -> recommendations.putIfAbsent(
                                book.getId(),
                                catalogToRecommendation(book, "Top genre: " + genre, "GENRE")
                        ));
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
}
