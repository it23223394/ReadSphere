package com.example.readsphere.controller;

import com.example.readsphere.model.BookCatalog;
import com.example.readsphere.repository.BookCatalogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "http://localhost:3000")
public class BookCatalogController {

    private final BookCatalogRepository catalogRepository;

    public BookCatalogController(BookCatalogRepository catalogRepository) {
        this.catalogRepository = catalogRepository;
    }

    @GetMapping("/genres")
    public List<String> getGenres() {
        return catalogRepository.findAll().stream()
                .map(BookCatalog::getGenre)
                .distinct()
                .sorted()
                .toList();
    }

    @GetMapping("/top-rated")
    public ResponseEntity<?> getTopRated(@RequestParam(value = "min", defaultValue = "4.5") Double minRating) {
        try {
            return ResponseEntity.ok(catalogRepository.findTopRated(minRating));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch top rated books: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(@RequestParam(value = "q", required = false) String query,
                                         @RequestParam(value = "by", defaultValue = "title") String searchBy) {
        try {
            if (query == null || query.isBlank()) {
                return ResponseEntity.ok(catalogRepository.findAll());
            }
            
            return ResponseEntity.ok(switch (searchBy.toLowerCase()) {
                case "author" -> catalogRepository.findByAuthorContainingIgnoreCase(query);
                case "title" -> catalogRepository.findByTitleContainingIgnoreCase(query);
                default -> catalogRepository.findByTitleContainingIgnoreCase(query);
            });
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Search failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBooks(@RequestParam(value = "genre", required = false) String genre) {
        try {
            if (genre != null && !genre.isBlank()) {
                return ResponseEntity.ok(catalogRepository.findByGenreIgnoreCase(genre));
            }
            return ResponseEntity.ok(catalogRepository.findAll());
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch books: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(catalogRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Book not found in catalog")));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Book not found: " + e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }
}
