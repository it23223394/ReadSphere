package com.example.readsphere.model;

import jakarta.persistence.*;

@Entity
@Table(name = "book_catalog")
public class BookCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String author;
    private String genre;
    
    @Column(length = 2000)
    private String description;
    
    private String coverUrl;
    private Double averageRating; // Aggregated rating (e.g., 4.3)
    private Integer totalPages;
    private String isbn;
    
    @Column(name = "published_year")
    private Integer publishedYear;

    public BookCatalog() {
    }

    public BookCatalog(String title, String author, String genre, String description, 
                       Double averageRating, Integer totalPages) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.description = description;
        this.averageRating = averageRating;
        this.totalPages = totalPages;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public Integer getPublishedYear() {
        return publishedYear;
    }

    public void setPublishedYear(Integer publishedYear) {
        this.publishedYear = publishedYear;
    }
}
