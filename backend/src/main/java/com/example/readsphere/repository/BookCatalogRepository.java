package com.example.readsphere.repository;

import com.example.readsphere.model.BookCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookCatalogRepository extends JpaRepository<BookCatalog, Long> {
    
    List<BookCatalog> findByGenreIgnoreCase(String genre);
    
    List<BookCatalog> findByTitleContainingIgnoreCase(String title);
    
    List<BookCatalog> findByAuthorContainingIgnoreCase(String author);
    
    @Query("SELECT b FROM BookCatalog b WHERE b.genre = :genre AND b.averageRating >= :minRating ORDER BY b.averageRating DESC")
    List<BookCatalog> findTopRatedByGenre(@Param("genre") String genre, @Param("minRating") Double minRating);
    
    @Query("SELECT b FROM BookCatalog b WHERE b.averageRating >= :minRating ORDER BY b.averageRating DESC")
    List<BookCatalog> findTopRated(@Param("minRating") Double minRating);
}
