package com.example.readsphere.dto;

import com.example.readsphere.model.Book;

public class RecommendationResponse {
    private Long bookId;
    private String title;
    private String author;
    private String genre;
    private String description;
    private Integer rating;
    private String coverUrl;
    private String status;
    private Integer totalPages;
    private Integer pagesRead;
    private String reason;
    private String strategy;

    public RecommendationResponse() {
    }

    public RecommendationResponse(Long bookId, String title, String author, String genre, String description, Integer rating,
                                  String coverUrl, String status, Integer totalPages, Integer pagesRead,
                                  String reason, String strategy) {
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.description = description;
        this.rating = rating;
        this.coverUrl = coverUrl;
        this.status = status;
        this.totalPages = totalPages;
        this.pagesRead = pagesRead;
        this.reason = reason;
        this.strategy = strategy;
    }

    public static RecommendationResponse from(Book book, String reason, String strategy) {
        return new RecommendationResponse(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getGenre(),
                null, // No description in legacy Book entity
                book.getRating(),
                book.getCoverUrl(),
                book.getStatus(),
                book.getTotalPages(),
                book.getPagesRead(),
                reason,
                strategy
        );
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }

    public Integer getPagesRead() {
        return pagesRead;
    }

    public void setPagesRead(Integer pagesRead) {
        this.pagesRead = pagesRead;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStrategy() {
        return strategy;
    }

    public void setStrategy(String strategy) {
        this.strategy = strategy;
    }
}
