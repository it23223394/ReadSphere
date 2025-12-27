package com.example.readsphere.repository;

import com.example.readsphere.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByUserId(Long userId);

    List<Book> findByUserIdAndStatusIgnoreCase(Long userId, String status);
    List<Book> findByUserIdAndTitleContainingIgnoreCase(Long userId, String title);
    List<Book> findByUserIdAndAuthorContainingIgnoreCase(Long userId, String author);
    List<Book> findByUserIdAndGenreContainingIgnoreCase(Long userId, String genre);
}
