package com.example.readsphere.service.recommendation;

import com.example.readsphere.model.Book;
import com.example.readsphere.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final BookRepository bookRepository;

    public RecommendationService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> recommendBooks(Long userId) {

        List<Book> userBooks = bookRepository.findByUserId(userId);

        // 1️⃣ Find user's favorite genres based on READ books
        Map<String, Long> genreFrequency = userBooks.stream()
                .filter(book -> "READ".equalsIgnoreCase(book.getStatus()))
                .collect(Collectors.groupingBy(
                        Book::getGenre,
                        Collectors.counting()
                ));

        if (genreFrequency.isEmpty()) {
            return Collections.emptyList();
        }

        // 2️⃣ Get top genre
        String favoriteGenre = Collections.max(
                genreFrequency.entrySet(),
                Map.Entry.comparingByValue()
        ).getKey();

        // 3️⃣ Recommend unread books in that genre (prefer higher ratings)
        return userBooks.stream()
                .filter(book -> !"READ".equalsIgnoreCase(book.getStatus()))
                .filter(book -> favoriteGenre.equalsIgnoreCase(book.getGenre()))
                .sorted(Comparator.comparing(
                        (Book b) -> Optional.ofNullable(b.getRating()).orElse(0)
                ).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }
}
