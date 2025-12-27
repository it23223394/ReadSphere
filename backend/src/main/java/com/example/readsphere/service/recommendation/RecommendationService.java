package com.example.readsphere.service.recommendation;

import com.example.readsphere.dto.RecommendationFeedbackRequest;
import com.example.readsphere.dto.RecommendationResponse;
import com.example.readsphere.model.Book;
import com.example.readsphere.model.RecommendationFeedback;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.repository.RecommendationFeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private static final int MAX_RESULTS = 10;

    private final BookRepository bookRepository;
    private final RecommendationFeedbackRepository feedbackRepository;

    public RecommendationService(BookRepository bookRepository, RecommendationFeedbackRepository feedbackRepository) {
        this.bookRepository = bookRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public List<RecommendationResponse> recommendBooks(Long userId, boolean refresh) {
        List<Book> userBooks = bookRepository.findByUserId(userId);
        if (userBooks.isEmpty()) {
            return List.of();
        }

        List<Book> readBooks = userBooks.stream()
                .filter(this::isRead)
                .toList();

        Map<String, Long> genreFrequency = readBooks.stream()
                .filter(book -> book.getGenre() != null && !book.getGenre().isBlank())
                .collect(Collectors.groupingBy(Book::getGenre, Collectors.counting()));

        Map<Long, RecommendationResponse> recommendations = new LinkedHashMap<>();

        // RS-501: Genre-based (top genres from completed books)
        genreFrequency.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(2)
                .forEach(entry -> {
                    String genre = entry.getKey();
                    userBooks.stream()
                            .filter(this::isNotRead)
                            .filter(book -> genre.equalsIgnoreCase(book.getGenre()))
                            .sorted(Comparator.comparing((Book b) -> Optional.ofNullable(b.getRating()).orElse(0)).reversed())
                            .forEach(book -> recommendations.putIfAbsent(
                                    book.getId(),
                                    RecommendationResponse.from(book, "Top genre: " + genre, "GENRE")
                            ));
                });

        // RS-502: Rating-based (books similar to highly-rated reads)
        List<Book> highlyRated = readBooks.stream()
                .filter(book -> Optional.ofNullable(book.getRating()).orElse(0) >= 4)
                .toList();

        for (Book favorite : highlyRated) {
            String genre = favorite.getGenre();
            if (genre == null || genre.isBlank()) {
                continue;
            }
            userBooks.stream()
                    .filter(this::isNotRead)
                    .filter(book -> !book.getId().equals(favorite.getId()))
                    .filter(book -> genre.equalsIgnoreCase(book.getGenre()))
                    .sorted(Comparator.comparing((Book b) -> Optional.ofNullable(b.getRating()).orElse(0)).reversed())
                    .forEach(book -> recommendations.putIfAbsent(
                            book.getId(),
                            RecommendationResponse.from(
                                    book,
                                    "Because you rated \"" + favorite.getTitle() + "\" " + favorite.getRating() + " stars",
                                    "RATING"
                            )
                    ));
        }

        // Fallback: offer unread books sorted by rating
        if (recommendations.isEmpty()) {
            userBooks.stream()
                    .filter(this::isNotRead)
                    .sorted(Comparator.comparing((Book b) -> Optional.ofNullable(b.getRating()).orElse(0)).reversed())
                    .forEach(book -> recommendations.putIfAbsent(
                            book.getId(),
                            RecommendationResponse.from(book, "Unread in your library", "FALLBACK")
                    ));
        }

        List<RecommendationResponse> result = recommendations.values().stream()
                .limit(MAX_RESULTS)
                .toList();

        if (refresh && result.size() > 1) {
            result = result.stream().sorted((a, b) -> Double.compare(Math.random(), 0.5)).toList();
        }

        return result;
    }

    public RecommendationFeedback submitFeedback(Long userId, Long bookId, RecommendationFeedbackRequest payload) {
        String feedback = Optional.ofNullable(payload.getFeedback())
                .map(String::trim)
                .map(String::toUpperCase)
                .orElse("");

        if (!feedback.equals("UP") && !feedback.equals("DOWN")) {
            throw new IllegalArgumentException("Feedback must be 'UP' or 'DOWN'");
        }

        bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        RecommendationFeedback record = new RecommendationFeedback(userId, bookId, feedback);
        return feedbackRepository.save(record);
    }

    private boolean isRead(Book book) {
        return book != null && book.getStatus() != null && "READ".equalsIgnoreCase(book.getStatus());
    }

    private boolean isNotRead(Book book) {
        return book != null && (book.getStatus() == null || !"READ".equalsIgnoreCase(book.getStatus()));
    }
}
