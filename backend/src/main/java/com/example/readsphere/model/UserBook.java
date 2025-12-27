package com.example.readsphere.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_books")
public class UserBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "catalog_book_id", nullable = false)
    private BookCatalog catalogBook;

    private String status; // READ, READING, WANT_TO_READ
    private Integer pagesRead;
    private Integer rating; // User's personal rating 1-5
    private String coverUrl; // Optional user-specific cover
    
    @Column(name = "added_date")
    private LocalDateTime addedDate;
    
    @Column(name = "started_date")
    private LocalDateTime startedDate;
    
    @Column(name = "finished_date")
    private LocalDateTime finishedDate;

    // One user book can have many notes
    @OneToMany(mappedBy = "userBook", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Note> notes;

    // One user book can have many quotes
    @OneToMany(mappedBy = "userBook", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Quote> quotes;

    public UserBook() {
    }

    public UserBook(User user, BookCatalog catalogBook, String status) {
        this.user = user;
        this.catalogBook = catalogBook;
        this.status = status;
        this.pagesRead = 0;
        this.addedDate = LocalDateTime.now();
    }

    @PrePersist
    public void onCreate() {
        if (addedDate == null) {
            addedDate = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BookCatalog getCatalogBook() {
        return catalogBook;
    }

    public void setCatalogBook(BookCatalog catalogBook) {
        this.catalogBook = catalogBook;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getPagesRead() {
        return pagesRead;
    }

    public void setPagesRead(Integer pagesRead) {
        this.pagesRead = pagesRead;
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

    public LocalDateTime getAddedDate() {
        return addedDate;
    }

    public void setAddedDate(LocalDateTime addedDate) {
        this.addedDate = addedDate;
    }

    public LocalDateTime getStartedDate() {
        return startedDate;
    }

    public void setStartedDate(LocalDateTime startedDate) {
        this.startedDate = startedDate;
    }

    public LocalDateTime getFinishedDate() {
        return finishedDate;
    }

    public void setFinishedDate(LocalDateTime finishedDate) {
        this.finishedDate = finishedDate;
    }

    public List<Note> getNotes() {
        return notes;
    }

    public void setNotes(List<Note> notes) {
        this.notes = notes;
    }

    public List<Quote> getQuotes() {
        return quotes;
    }

    public void setQuotes(List<Quote> quotes) {
        this.quotes = quotes;
    }
}
