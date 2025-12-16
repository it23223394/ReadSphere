package com.example.readsphere.controller;

import com.example.readsphere.model.Book;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.service.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "http://localhost:3000")
public class PdfController {

    private final PdfService pdfService;
    private final BookRepository bookRepository;

    public PdfController(PdfService pdfService, BookRepository bookRepository) {
        this.pdfService = pdfService;
        this.bookRepository = bookRepository;
    }

    @GetMapping("/favorites/{userId}")
    public ResponseEntity<byte[]> downloadFavorites(@PathVariable Long userId) {
        // Get all books for the user
        List<Book> allBooks = bookRepository.findByUserId(userId);
        
        // Filter for READ books with high ratings (4-5 stars) or all READ books if no ratings
        List<Book> favoriteBooks = allBooks.stream()
                .filter(book -> "READ".equalsIgnoreCase(book.getStatus()))
                .filter(book -> book.getRating() == null || book.getRating() >= 4)
                .limit(10)
                .collect(Collectors.toList());

        byte[] pdfBytes = pdfService.generateBooksPdf(favoriteBooks, "My Favorite Books");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=favorites.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/top5/{userId}")
    public ResponseEntity<byte[]> downloadTop5(@PathVariable Long userId) {
        // Get top 5 rated books
        List<Book> topBooks = bookRepository.findByUserId(userId).stream()
                .filter(book -> "READ".equalsIgnoreCase(book.getStatus()))
                .filter(book -> book.getRating() != null)
                .sorted((b1, b2) -> Integer.compare(b2.getRating(), b1.getRating()))
                .limit(5)
                .collect(Collectors.toList());

        byte[] pdfBytes = pdfService.generateBooksPdf(topBooks, "Top 5 Books That Changed My Life");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=top5-books.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/all/{userId}")
    public ResponseEntity<byte[]> downloadAllBooks(@PathVariable Long userId) {
        List<Book> allBooks = bookRepository.findByUserId(userId);

        byte[] pdfBytes = pdfService.generateBooksPdf(allBooks, "My Complete Book Collection");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=my-books.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
