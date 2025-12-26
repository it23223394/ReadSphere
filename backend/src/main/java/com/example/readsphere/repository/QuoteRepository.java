package com.example.readsphere.repository;

import com.example.readsphere.model.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long> {
    List<Quote> findByBookIdOrderByIdDesc(Long bookId);
    List<Quote> findByTextContainingIgnoreCase(String q);
    List<Quote> findByBookIdAndTextContainingIgnoreCase(Long bookId, String q);

    // Filter quotes by book and owning user
    @org.springframework.data.jpa.repository.Query(
        "SELECT q FROM Quote q WHERE q.book.id = :bookId AND q.book.user.id = :userId ORDER BY q.id DESC"
    )
    List<Quote> findByBookIdAndUserIdOrderByIdDesc(
        @org.springframework.data.repository.query.Param("bookId") Long bookId,
        @org.springframework.data.repository.query.Param("userId") Long userId
    );
}
