package com.example.readsphere.controller;

import com.example.readsphere.dto.BookRequest;
import com.example.readsphere.model.BookCatalog;
import com.example.readsphere.model.User;
import com.example.readsphere.model.UserBook;
import com.example.readsphere.repository.BookCatalogRepository;
import com.example.readsphere.repository.UserBookRepository;
import com.example.readsphere.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import com.example.readsphere.service.storage.AzureBlobService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user-books")
@CrossOrigin(origins = "http://localhost:3000")
public class UserBookController {

    private final UserBookRepository userBookRepository;
    private final BookCatalogRepository catalogRepository;
    private final UserRepository userRepository;
    private final AzureBlobService azureBlobService;

    public UserBookController(UserBookRepository userBookRepository,
                              BookCatalogRepository catalogRepository,
                              UserRepository userRepository,
                              AzureBlobService azureBlobService) {
        this.userBookRepository = userBookRepository;
        this.catalogRepository = catalogRepository;
        this.userRepository = userRepository;
        this.azureBlobService = azureBlobService;
    }

    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getUserBooks(@PathVariable Long userId) {
        List<UserBook> userBooks = userBookRepository.findByUserId(userId);
        return userBooks.stream().map(this::userBookToMap).collect(Collectors.toList());
    }

    @PostMapping("/user/{userId}/add/{catalogBookId}")
    public ResponseEntity<Map<String, Object>> addBookToShelf(@PathVariable Long userId,
                                                               @PathVariable Long catalogBookId,
                                                               @RequestBody(required = false) Map<String, String> request) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            BookCatalog catalogBook = catalogRepository.findById(catalogBookId)
                    .orElseThrow(() -> new RuntimeException("Book not found in catalog"));

            // Check if already added
            var existing = userBookRepository.findByUserIdAndCatalogBookId(userId, catalogBookId);
            if (existing.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Book already in your library");
                response.put("userBook", userBookToMap(existing.get()));
                return ResponseEntity.ok(response);
            }

            String status = (request != null && request.get("status") != null) 
                    ? request.get("status") 
                    : "WANT_TO_READ";

            UserBook userBook = new UserBook(user, catalogBook, status);
            userBook = userBookRepository.save(userBook);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Book added to your shelf");
            response.put("userBook", userBookToMap(userBook));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PutMapping("/{userBookId}")
    public ResponseEntity<Map<String, Object>> updateUserBook(@PathVariable Long userBookId,
                                                              @RequestBody BookRequest request) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new RuntimeException("User book not found"));

        if (request.getStatus() != null) {
            userBook.setStatus(request.getStatus());
        }
        if (request.getPagesRead() != null && request.getPagesRead() >= 0) {
            userBook.setPagesRead(request.getPagesRead());
        }
        if (request.getRating() != null && request.getRating() >= 1 && request.getRating() <= 5) {
            userBook.setRating(request.getRating());
        }

        userBook = userBookRepository.save(userBook);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Book updated");
        response.put("userBook", userBookToMap(userBook));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userBookId}")
    public ResponseEntity<Map<String, String>> deleteUserBook(@PathVariable Long userBookId) {
        userBookRepository.deleteById(userBookId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Book removed from shelf");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{userBookId}/cover")
    public ResponseEntity<?> uploadUserBookCover(@PathVariable Long userBookId, @RequestParam("file") MultipartFile file) {
        return userBookRepository.findById(userBookId).map(ub -> {
            try {
                String url = azureBlobService.uploadCover(file);
                ub.setCoverUrl(url);
                userBookRepository.save(ub);
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Cover updated");
                response.put("userBook", userBookToMap(ub));
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Image upload failed: " + e.getMessage());
                return ResponseEntity.internalServerError().body(error);
            }
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "User book not found")));
    }

    private Map<String, Object> userBookToMap(UserBook ub) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", ub.getId());
        map.put("userId", ub.getUser().getId());
        map.put("status", ub.getStatus());
        map.put("pagesRead", ub.getPagesRead());
        map.put("rating", ub.getRating());
        map.put("addedDate", ub.getAddedDate());
        map.put("startedDate", ub.getStartedDate());
        map.put("finishedDate", ub.getFinishedDate());
        
        BookCatalog book = ub.getCatalogBook();
        Map<String, Object> bookData = new HashMap<>();
        bookData.put("id", book.getId());
        bookData.put("title", book.getTitle());
        bookData.put("author", book.getAuthor());
        bookData.put("genre", book.getGenre());
        bookData.put("description", book.getDescription());
        bookData.put("coverUrl", ub.getCoverUrl() != null ? ub.getCoverUrl() : book.getCoverUrl());
        bookData.put("averageRating", book.getAverageRating());
        bookData.put("totalPages", book.getTotalPages());
        map.put("book", bookData);
        
        return map;
    }
}
