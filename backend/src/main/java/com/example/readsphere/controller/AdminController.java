package com.example.readsphere.controller;

import com.example.readsphere.model.User;
import com.example.readsphere.model.Note;
import com.example.readsphere.model.Quote;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.repository.UserRepository;
import com.example.readsphere.repository.NoteRepository;
import com.example.readsphere.repository.QuoteRepository;
import com.example.readsphere.repository.ReadingLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;
import com.example.readsphere.model.BookCatalog;
import com.example.readsphere.repository.BookCatalogRepository;
import com.example.readsphere.dto.CatalogBookRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;


    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookCatalogRepository catalogRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private ReadingLogRepository readingLogRepository;
    /**
     * Admin Dashboard Overview
     * GET /api/admin/dashboard
     * Returns: total users, active users, total books, platform stats
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        try {
            // Get stats
            long totalUsers = userRepository.count();
            long totalAdmins = userRepository.countByRole(User.Role.ADMIN);
            long totalRegularUsers = userRepository.countByRole(User.Role.USER);
            long totalCatalogBooks = catalogRepository.count();
            long totalUserBooks = bookRepository.count();
            long totalNotes = noteRepository.count();
            long totalQuotes = quoteRepository.count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalAdmins", totalAdmins);
            stats.put("totalRegularUsers", totalRegularUsers);
            // totalBooks represents catalog titles for the dashboard
            stats.put("totalBooks", totalCatalogBooks);
            stats.put("totalUserBooks", totalUserBooks);
            stats.put("totalNotes", totalNotes);
            stats.put("totalQuotes", totalQuotes);
            stats.put("message", "Dashboard data retrieved successfully");

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch dashboard data: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * List All Users (Admin only)
     * GET /api/admin/users
     * Returns: list of all users with basic info
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("email", user.getEmail());
                userMap.put("role", user.getRole().name());
                userMap.put("emailVerified", user.isEmailVerified());
                return userMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch users: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get User Details (Admin only)
     * GET /api/admin/users/{id}
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole().name());
            userMap.put("emailVerified", user.isEmailVerified());
            userMap.put("readingGoalBooksPerMonth", user.getReadingGoalBooksPerMonth());
            userMap.put("readingGoalPagesPerDay", user.getReadingGoalPagesPerDay());
            userMap.put("theme", user.getTheme());
            userMap.put("notificationsEnabled", user.getNotificationsEnabled());

            return ResponseEntity.ok(userMap);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch user: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Health check
     * GET /api/admin/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Admin service is running");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }

    /**
     * System health (admin namespace)
     * GET /api/admin/system/health
     */
    @GetMapping("/system/health")
    public ResponseEntity<Map<String, Object>> systemHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("message", "System health OK");
        return ResponseEntity.ok(response);
    }

    /**
     * System logs (demo placeholder)
     * GET /api/admin/system/logs
     */
    @GetMapping("/system/logs")
    public ResponseEntity<Map<String, Object>> systemLogs() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Log tailing is not enabled in this demo build");
        response.put("hint", "Integrate with a log store (e.g., CloudWatch, ELK) for production");
        return ResponseEntity.ok(response);
    }

    /**
     * Delete User (Admin only) - Hard delete
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Prevent deleting the only admin
            if (user.getRole() == User.Role.ADMIN && userRepository.countByRole(User.Role.ADMIN) <= 1) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot delete the last admin user");
                return ResponseEntity.status(400).body(error);
            }

            userRepository.delete(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Deactivate User (Admin only)
     * PATCH /api/admin/users/{id}/deactivate
     */
    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Prevent deactivating the last admin
            if (user.getRole() == User.Role.ADMIN && userRepository.countByRole(User.Role.ADMIN) <= 1) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot deactivate the last admin user");
                return ResponseEntity.status(400).body(error);
            }

            // Delete user (can enhance with status field later)
            userRepository.delete(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deactivated successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to deactivate user: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Moderation: list notes (optionally flagged only, optionally search)
     * GET /api/admin/moderation/notes
     */
    @GetMapping("/moderation/notes")
    public ResponseEntity<?> listNotes(
            @RequestParam(defaultValue = "false") boolean flaggedOnly,
            @RequestParam(required = false) String search) {
        try {
            List<Note> notes;
            if (flaggedOnly) {
                if (search != null && !search.trim().isEmpty()) {
                    notes = noteRepository.findByFlaggedTrueAndTextContainingIgnoreCaseOrderByCreatedAtDesc(search);
                } else {
                    notes = noteRepository.findByFlaggedTrueOrderByCreatedAtDesc();
                }
            } else {
                if (search != null && !search.trim().isEmpty()) {
                    notes = noteRepository.findByTextContainingIgnoreCase(search);
                } else {
                    notes = noteRepository.findAll();
                }
            }
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch notes: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Moderation: delete a note
     * DELETE /api/admin/moderation/notes/{id}
     */
    @DeleteMapping("/moderation/notes/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        try {
            noteRepository.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Note deleted");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete note: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Moderation: list quotes (optionally flagged only, optionally search)
     * GET /api/admin/moderation/quotes
     */
    @GetMapping("/moderation/quotes")
    public ResponseEntity<?> listQuotes(
            @RequestParam(defaultValue = "false") boolean flaggedOnly,
            @RequestParam(required = false) String search) {
        try {
            List<Quote> quotes;
            if (flaggedOnly) {
                if (search != null && !search.trim().isEmpty()) {
                    quotes = quoteRepository.findByFlaggedTrueAndTextContainingIgnoreCaseOrderByIdDesc(search);
                } else {
                    quotes = quoteRepository.findByFlaggedTrueOrderByIdDesc();
                }
            } else {
                if (search != null && !search.trim().isEmpty()) {
                    quotes = quoteRepository.findByTextContainingIgnoreCase(search);
                } else {
                    quotes = quoteRepository.findAll();
                }
            }
            return ResponseEntity.ok(quotes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch quotes: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Moderation: delete a quote
     * DELETE /api/admin/moderation/quotes/{id}
     */
    @DeleteMapping("/moderation/quotes/{id}")
    public ResponseEntity<?> deleteQuote(@PathVariable Long id) {
        try {
            quoteRepository.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Quote deleted");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete quote: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Analytics overview (simple counts)
     * GET /api/admin/analytics/overview
     */
    @GetMapping("/analytics/overview")
    public ResponseEntity<?> analyticsOverview() {
        try {
            Map<String, Object> metrics = new HashMap<>();
            metrics.put("totalUsers", userRepository.count());
            metrics.put("totalAdmins", userRepository.countByRole(User.Role.ADMIN));
            metrics.put("totalRegularUsers", userRepository.countByRole(User.Role.USER));
            metrics.put("totalCatalogBooks", catalogRepository.count());
            metrics.put("totalUserBooks", bookRepository.count());
            metrics.put("totalNotes", noteRepository.count());
            metrics.put("totalQuotes", quoteRepository.count());
            metrics.put("message", "Analytics snapshot");
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch analytics: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Analytics reading (placeholder)
     * GET /api/admin/analytics/reading
     */
    @GetMapping("/analytics/reading")
    public ResponseEntity<?> analyticsReading(@RequestParam(defaultValue = "weekly") String range) {
        try {
            int days = range.equalsIgnoreCase("monthly") ? 30 : 7;
            LocalDate today = LocalDate.now();
            LocalDate from = today.minusDays(days - 1);

            // Pages per day across all users
            Map<LocalDate, Integer> pagesByDay = new LinkedHashMap<>();
            for (int i = 0; i < days; i++) pagesByDay.put(from.plusDays(i), 0);

            List<com.example.readsphere.model.ReadingLog> logs7 = readingLogRepository.findByDateBetweenOrderByDateAsc(from, today);
            for (com.example.readsphere.model.ReadingLog rl : logs7) {
                pagesByDay.put(rl.getDate(), pagesByDay.getOrDefault(rl.getDate(), 0) + rl.getPages());
            }

            List<Map<String, Object>> daily = new ArrayList<>();
            pagesByDay.forEach((d, p) -> {
                Map<String, Object> m = new HashMap<>();
                m.put("date", d.toString());
                m.put("pages", p);
                daily.add(m);
            });

            // Genre breakdown over last 30 days
            LocalDate from30 = today.minusDays(29);
            List<com.example.readsphere.model.ReadingLog> logs30 = readingLogRepository.findByDateBetween(from30, today);
            Map<String, Integer> genrePages = new HashMap<>();
            Map<String, Integer> bookPages = new HashMap<>();
            for (com.example.readsphere.model.ReadingLog rl : logs30) {
                String genre;
                String title;
                if (rl.getBook() != null) {
                    genre = rl.getBook().getGenre() != null ? rl.getBook().getGenre() : "Unknown";
                    title = rl.getBook().getTitle() != null ? rl.getBook().getTitle() : "(Untitled)";
                } else {
                    genre = "Unknown";
                    title = "(Untitled)";
                }
                genrePages.put(genre, genrePages.getOrDefault(genre, 0) + rl.getPages());
                bookPages.put(title, bookPages.getOrDefault(title, 0) + rl.getPages());
            }

            // Top 5 books by pages
            List<Map.Entry<String, Integer>> sortedBooks = new ArrayList<>(bookPages.entrySet());
            sortedBooks.sort((a, b) -> Integer.compare(b.getValue(), a.getValue()));
            List<Map<String, Object>> topBooks = new ArrayList<>();
            for (int i = 0; i < Math.min(5, sortedBooks.size()); i++) {
                Map<String, Object> m = new HashMap<>();
                m.put("title", sortedBooks.get(i).getKey());
                m.put("pages", sortedBooks.get(i).getValue());
                topBooks.add(m);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("dailyPages", daily);
            response.put("genreBreakdown", genrePages);
            response.put("topBooks", topBooks);
            response.put("range", range);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("dailyPages", new ArrayList<>());
            fallback.put("genreBreakdown", new HashMap<>());
            fallback.put("topBooks", new ArrayList<>());
            fallback.put("range", range);
            fallback.put("warning", "Reading analytics unavailable: " + e.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }

    /**
     * List Catalog Books (Admin only)
     * GET /api/admin/catalog?page=0&size=20&search=query
     */
    @GetMapping("/catalog")
    public ResponseEntity<?> listCatalog(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<BookCatalog> booksPage;
            
            if (search != null && !search.trim().isEmpty()) {
                booksPage = catalogRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
                    search, search, pageable);
            } else {
                booksPage = catalogRepository.findAll(pageable);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("books", booksPage.getContent());
            response.put("totalElements", booksPage.getTotalElements());
            response.put("totalPages", booksPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch catalog: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Get Single Catalog Book
     * GET /api/admin/catalog/{id}
     */
    @GetMapping("/catalog/{id}")
    public ResponseEntity<?> getCatalogBook(@PathVariable Long id) {
        try {
            BookCatalog book = catalogRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Book not found"));
            return ResponseEntity.ok(book);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch book: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Create Catalog Book
     * POST /api/admin/catalog
     */
    @PostMapping("/catalog")
    public ResponseEntity<?> createCatalogBook(@RequestBody CatalogBookRequest request) {
        try {
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("error", "Title is required"));
            }
            if (request.getAuthor() == null || request.getAuthor().trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("error", "Author is required"));
            }
            if (request.getGenre() == null || request.getGenre().trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("error", "Genre is required"));
            }

            BookCatalog book = new BookCatalog();
            book.setTitle(request.getTitle().trim());
            book.setAuthor(request.getAuthor().trim());
            book.setGenre(request.getGenre().trim());
            book.setDescription(request.getDescription());
            // Map DTO fields to entity naming
            book.setAverageRating(request.getRating() != null ? request.getRating() : 0.0);
            book.setTotalPages(request.getPageCount() != null ? request.getPageCount() : 0);

            BookCatalog saved = catalogRepository.save(book);
            
            return ResponseEntity.status(201).body(Map.of("id", saved.getId(), "message", "Book created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create book: " + e.getMessage()));
        }
    }

    /**
     * Update Catalog Book
     * PUT /api/admin/catalog/{id}
     */
    @PutMapping("/catalog/{id}")
    public ResponseEntity<?> updateCatalogBook(@PathVariable Long id, @RequestBody CatalogBookRequest request) {
        try {
            BookCatalog book = catalogRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Book not found"));

            if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
                book.setTitle(request.getTitle().trim());
            }
            if (request.getAuthor() != null && !request.getAuthor().trim().isEmpty()) {
                book.setAuthor(request.getAuthor().trim());
            }
            if (request.getGenre() != null && !request.getGenre().trim().isEmpty()) {
                book.setGenre(request.getGenre().trim());
            }
            if (request.getDescription() != null) {
                book.setDescription(request.getDescription());
            }
            if (request.getRating() != null) {
                book.setAverageRating(request.getRating());
            }
            if (request.getPageCount() != null) {
                book.setTotalPages(request.getPageCount());
            }

            catalogRepository.save(book);
            
            return ResponseEntity.ok(Map.of("message", "Book updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update book: " + e.getMessage()));
        }
    }

    /**
     * Delete Catalog Book
     * DELETE /api/admin/catalog/{id}
     */
    @DeleteMapping("/catalog/{id}")
    public ResponseEntity<?> deleteCatalogBook(@PathVariable Long id) {
        try {
            BookCatalog book = catalogRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Book not found"));

            catalogRepository.delete(book);
            
            return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete book: " + e.getMessage()));
        }
    }
}
