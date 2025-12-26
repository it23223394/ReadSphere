package com.example.readsphere.repository;

import com.example.readsphere.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByBookIdOrderByCreatedAtDesc(Long bookId);
    List<Note> findByTextContainingIgnoreCase(String q);
    List<Note> findByBookIdAndTextContainingIgnoreCase(Long bookId, String q);

    // Filter notes by book and owning user
    @org.springframework.data.jpa.repository.Query(
        "SELECT n FROM Note n WHERE n.book.id = :bookId AND n.book.user.id = :userId ORDER BY n.createdAt DESC"
    )
    List<Note> findByBookIdAndUserIdOrderByCreatedAtDesc(
        @org.springframework.data.repository.query.Param("bookId") Long bookId,
        @org.springframework.data.repository.query.Param("userId") Long userId
    );
}
