package com.example.readsphere.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "quotes")
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String text;
    
    private int pageNumber;

    private String imageUrl; // optional image attachment

    @ManyToOne
    @JoinColumn(name = "book_id")
    @JsonBackReference
    private Book book;

    @ManyToOne
    @JoinColumn(name = "user_book_id")
    @JsonBackReference
    private UserBook userBook;

    public Quote() {}

    public Quote(String text, int pageNumber) {
        this.text = text;
        this.pageNumber = pageNumber;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    public UserBook getUserBook() { return userBook; }
    public void setUserBook(UserBook userBook) { this.userBook = userBook; }
}
