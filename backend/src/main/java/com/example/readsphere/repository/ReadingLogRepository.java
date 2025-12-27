package com.example.readsphere.repository;

import com.example.readsphere.model.ReadingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReadingLogRepository extends JpaRepository<ReadingLog, Long> {
    List<ReadingLog> findByUserIdAndDateBetweenOrderByDateAsc(Long userId, LocalDate from, LocalDate to);
    List<ReadingLog> findByUserIdOrderByDateDesc(Long userId);
    List<ReadingLog> findByDateBetweenOrderByDateAsc(LocalDate from, LocalDate to);
    List<ReadingLog> findByDateBetween(LocalDate from, LocalDate to);
}
