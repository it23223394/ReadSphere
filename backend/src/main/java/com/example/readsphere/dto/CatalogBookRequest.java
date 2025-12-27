package com.example.readsphere.dto;

/**
 * DTO for creating/updating catalog books
 */
public class CatalogBookRequest {
    private String title;
    private String author;
    private String genre;
    private String description;
    private Double rating;
    private Integer pageCount;

    // Constructors
    public CatalogBookRequest() {}

    public CatalogBookRequest(String title, String author, String genre, String description, Double rating, Integer pageCount) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.description = description;
        this.rating = rating;
        this.pageCount = pageCount;
    }

    // Getters and Setters
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

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }
}
