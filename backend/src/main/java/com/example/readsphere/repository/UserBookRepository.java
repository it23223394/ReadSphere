package com.example.readsphere.repository;

import com.example.readsphere.model.UserBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBookRepository extends JpaRepository<UserBook, Long> {
    
    List<UserBook> findByUserId(Long userId);
    
    List<UserBook> findByUserIdAndStatusIgnoreCase(Long userId, String status);
    
    @Query("SELECT ub FROM UserBook ub WHERE ub.user.id = :userId AND ub.catalogBook.id = :catalogBookId")
    Optional<UserBook> findByUserIdAndCatalogBookId(@Param("userId") Long userId, @Param("catalogBookId") Long catalogBookId);
    
    @Query("SELECT ub FROM UserBook ub WHERE ub.user.id = :userId AND ub.status = 'READ' ORDER BY ub.finishedDate DESC")
    List<UserBook> findReadBooksByUser(@Param("userId") Long userId);
    
    @Query("SELECT ub FROM UserBook ub WHERE ub.user.id = :userId AND ub.rating >= :minRating")
    List<UserBook> findHighlyRatedByUser(@Param("userId") Long userId, @Param("minRating") Integer minRating);
}
