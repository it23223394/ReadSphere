package com.example.readsphere.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reading_logs")
public class ReadingLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    private int pages;
    private LocalDate date;

    public ReadingLog() {}
    public ReadingLog(User user, Book book, int pages, LocalDate date) {
        this.user = user; this.book = book; this.pages = pages; this.date = date;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    public int getPages() { return pages; }
    public void setPages(int pages) { this.pages = pages; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
