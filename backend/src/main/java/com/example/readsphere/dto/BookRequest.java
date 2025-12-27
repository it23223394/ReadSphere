package com.example.readsphere.dto;

import jakarta.validation.constraints.*;

public class BookRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String author;
    @NotBlank
    private String genre;
    @Min(1)
    private Integer totalPages;
    @Min(0)
    private Integer pagesRead;
    @Pattern(regexp = "(?i)READ|READING|WANT_TO_READ", message = "Status must be READ, READING or WANT_TO_READ")
    private String status;
    @Min(1) @Max(5)
    private Integer rating;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public Integer getTotalPages() { return totalPages; }
    public void setTotalPages(Integer totalPages) { this.totalPages = totalPages; }
    public Integer getPagesRead() { return pagesRead; }
    public void setPagesRead(Integer pagesRead) { this.pagesRead = pagesRead; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
