package com.example.readsphere.controller;

import com.example.readsphere.model.Book;
import com.example.readsphere.model.Quote;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.repository.QuoteRepository;
import com.example.readsphere.service.storage.AzureBlobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/quotes")
@CrossOrigin(origins = "http://localhost:3000")
public class QuoteController {

    private final QuoteRepository quoteRepository;
    private final BookRepository bookRepository;
    private final AzureBlobService azureBlobService;

    public QuoteController(QuoteRepository quoteRepository, BookRepository bookRepository, AzureBlobService azureBlobService) {
        this.quoteRepository = quoteRepository;
        this.bookRepository = bookRepository;
        this.azureBlobService = azureBlobService;
    }

    @GetMapping("/book/{bookId}")
    public List<Quote> byBook(@PathVariable Long bookId, @RequestParam(required = false) Long userId) {
        if (userId != null) {
            return quoteRepository.findByBookIdAndUserIdOrderByIdDesc(bookId, userId);
        }
        return quoteRepository.findByBookIdOrderByIdDesc(bookId);
    }

    @PostMapping("/book/{bookId}")
    public ResponseEntity<?> add(@PathVariable Long bookId, @RequestBody Map<String, Object> payload) {
        Optional<Book> b = bookRepository.findById(bookId);
        if (b.isEmpty()) return ResponseEntity.badRequest().body("Invalid bookId");
        String text = (String) payload.getOrDefault("text", "");
        int pageNumber = ((Number) payload.getOrDefault("pageNumber", 0)).intValue();
        Quote q = new Quote(text, pageNumber);
        q.setBook(b.get());
        return ResponseEntity.ok(quoteRepository.save(q));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> edit(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return quoteRepository.findById(id).map(q -> {
            if (payload.containsKey("text")) q.setText((String) payload.get("text"));
            if (payload.containsKey("pageNumber")) q.setPageNumber(((Number) payload.get("pageNumber")).intValue());
            return ResponseEntity.ok(quoteRepository.save(q));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!quoteRepository.existsById(id)) return ResponseEntity.notFound().build();
        quoteRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return quoteRepository.findById(id).map(q -> {
            try {
                String url = azureBlobService.uploadCover(file);
                q.setImageUrl(url);
                return ResponseEntity.ok(quoteRepository.save(q));
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Image upload failed: " + e.getMessage());
                return ResponseEntity.internalServerError().body(error);
            }
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "Quote not found")));
    }

    @GetMapping("/search")
    public List<Quote> search(@RequestParam("q") String q, @RequestParam(value = "bookId", required = false) Long bookId) {
        if (bookId != null) return quoteRepository.findByBookIdAndTextContainingIgnoreCase(bookId, q);
        return quoteRepository.findByTextContainingIgnoreCase(q);
    }
}
