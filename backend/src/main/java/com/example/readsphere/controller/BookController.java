package com.example.readsphere.controller;

import com.example.readsphere.model.Book;
import com.example.readsphere.model.User;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.repository.UserRepository;
import com.example.readsphere.repository.ReadingLogRepository;
import com.example.readsphere.dto.BookRequest;
import com.example.readsphere.dto.ImportResult;
import com.example.readsphere.service.storage.AzureBlobService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:3000")
public class BookController {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final AzureBlobService azureBlobService;
    private final ReadingLogRepository readingLogRepository;

    public BookController(BookRepository bookRepository, UserRepository userRepository, AzureBlobService azureBlobService, ReadingLogRepository readingLogRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.azureBlobService = azureBlobService;
        this.readingLogRepository = readingLogRepository;
    }

    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Book> getBooksByUser(@PathVariable Long userId) {
        return bookRepository.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> addBook(@PathVariable Long userId, @Validated @RequestBody BookRequest req) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("Invalid userId");
        Book b = new Book(req.getTitle(), req.getAuthor(), req.getGenre(), req.getTotalPages(), req.getPagesRead(), req.getStatus());
        b.setRating(req.getRating());
        b.setUser(userOpt.get());
        Book saved = bookRepository.save(b);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @Validated @RequestBody BookRequest req) {
        Optional<Book> existingOpt = bookRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        Book b = existingOpt.get();
        b.setTitle(req.getTitle());
        b.setAuthor(req.getAuthor());
        b.setGenre(req.getGenre());
        b.setTotalPages(req.getTotalPages());
        b.setPagesRead(req.getPagesRead());
        b.setStatus(req.getStatus());
        b.setRating(req.getRating());
        Book saved = bookRepository.save(b);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        if (!bookRepository.existsById(id)) return ResponseEntity.notFound().build();
        
        // First, delete all reading logs associated with this book
        readingLogRepository.deleteByBookId(id);
        
        // Then delete the book (cascade will remove notes/quotes)
        bookRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<?> updateProgress(@PathVariable Long id, @RequestParam("pagesRead") int pagesRead) {
        Optional<Book> existingOpt = bookRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        Book b = existingOpt.get();
        if (pagesRead < 0) pagesRead = 0;
        if (pagesRead > b.getTotalPages()) pagesRead = b.getTotalPages();
        b.setPagesRead(pagesRead);
        if (pagesRead == 0) {
            b.setStatus("WANT_TO_READ");
        } else if (pagesRead >= b.getTotalPages()) {
            b.setStatus("READ");
        } else {
            b.setStatus("READING");
        }
        Book saved = bookRepository.save(b);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}/search")
    public List<Book> searchBooks(@PathVariable Long userId, @RequestParam("q") String q) {
        String query = q == null ? "" : q.trim();
        Set<Book> result = new HashSet<>();
        if (!query.isEmpty()) {
            result.addAll(bookRepository.findByUserIdAndTitleContainingIgnoreCase(userId, query));
            result.addAll(bookRepository.findByUserIdAndAuthorContainingIgnoreCase(userId, query));
            result.addAll(bookRepository.findByUserIdAndGenreContainingIgnoreCase(userId, query));
        } else {
            result.addAll(bookRepository.findByUserId(userId));
        }
        return new ArrayList<>(result);
    }

    @GetMapping("/user/{userId}/status")
    public List<Book> filterByStatus(@PathVariable Long userId, @RequestParam("status") String status) {
        return bookRepository.findByUserIdAndStatusIgnoreCase(userId, status);
    }

    @PostMapping("/{id}/cover")
    public ResponseEntity<?> uploadCover(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<Book> existingOpt = bookRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        try {
            String url = azureBlobService.uploadCover(file);
            Book b = existingOpt.get();
            b.setCoverUrl(url);
            bookRepository.save(b);
            return ResponseEntity.ok(b);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/user/{userId}/import-csv")
    public ResponseEntity<ImportResult> importCsv(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body(new ImportResult(0, 0, "Invalid userId"));
        int imported = 0, failed = 0;
        try {
            String content = new String(file.getBytes());
            String[] lines = content.split("\r?\n");
            for (String line : lines) {
                if (line.trim().isEmpty()) continue;
                // CSV: title,author,genre,totalPages,status,pagesRead(optional),rating(optional)
                String[] parts = line.split(",");
                try {
                    String title = parts[0].trim();
                    String author = parts[1].trim();
                    String genre = parts[2].trim();
                    int totalPages = Integer.parseInt(parts[3].trim());
                    String status = parts[4].trim();
                    int pagesRead = (parts.length > 5 && !parts[5].trim().isEmpty()) ? Integer.parseInt(parts[5].trim()) : 0;
                    Integer rating = (parts.length > 6 && !parts[6].trim().isEmpty()) ? Integer.parseInt(parts[6].trim()) : null;
                    Book b = new Book(title, author, genre, totalPages, pagesRead, status);
                    b.setRating(rating);
                    b.setUser(userOpt.get());
                    bookRepository.save(b);
                    imported++;
                } catch (Exception ex) {
                    failed++;
                }
            }
            return ResponseEntity.ok(new ImportResult(imported, failed, "Import completed"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ImportResult(imported, failed, e.getMessage()));
        }
    }
}
