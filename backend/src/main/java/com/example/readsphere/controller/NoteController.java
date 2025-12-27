package com.example.readsphere.controller;

import com.example.readsphere.model.Book;
import com.example.readsphere.model.Note;
import com.example.readsphere.model.Tag;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.repository.NoteRepository;
import com.example.readsphere.repository.TagRepository;
import com.example.readsphere.service.storage.AzureBlobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:3000")
public class NoteController {

    private final NoteRepository noteRepository;
    private final BookRepository bookRepository;
    private final TagRepository tagRepository;
    private final AzureBlobService azureBlobService;

    public NoteController(NoteRepository noteRepository, BookRepository bookRepository, TagRepository tagRepository, AzureBlobService azureBlobService) {
        this.noteRepository = noteRepository;
        this.bookRepository = bookRepository;
        this.tagRepository = tagRepository;
        this.azureBlobService = azureBlobService;
    }

    @GetMapping("/book/{bookId}")
    public List<Note> byBook(@PathVariable Long bookId, @RequestParam(required = false) Long userId) {
        if (userId != null) {
            return noteRepository.findByBookIdAndUserIdOrderByCreatedAtDesc(bookId, userId);
        }
        return noteRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    @PostMapping("/book/{bookId}")
    public ResponseEntity<?> add(@PathVariable Long bookId, @RequestBody Map<String, String> payload) {
        Optional<Book> b = bookRepository.findById(bookId);
        if (b.isEmpty()) return ResponseEntity.badRequest().body("Invalid bookId");
        String text = payload.getOrDefault("text", "");
        Note n = new Note(text);
        n.setBook(b.get());
        return ResponseEntity.ok(noteRepository.save(n));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> edit(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return noteRepository.findById(id).map(n -> {
            n.setText(payload.getOrDefault("text", n.getText()));
            return ResponseEntity.ok(noteRepository.save(n));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!noteRepository.existsById(id)) return ResponseEntity.notFound().build();
        noteRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return noteRepository.findById(id).map(n -> {
            try {
                String url = azureBlobService.uploadCover(file);
                n.setImageUrl(url);
                return ResponseEntity.ok(noteRepository.save(n));
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Image upload failed: " + e.getMessage());
                return ResponseEntity.internalServerError().body(error);
            }
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "Note not found")));
    }

    @GetMapping("/search")
    public List<Note> search(@RequestParam("q") String q, @RequestParam(value = "bookId", required = false) Long bookId) {
        if (bookId != null) return noteRepository.findByBookIdAndTextContainingIgnoreCase(bookId, q);
        return noteRepository.findByTextContainingIgnoreCase(q);
    }

    @PostMapping("/{id}/tags")
    public ResponseEntity<?> setTags(@PathVariable Long id, @RequestBody List<String> tags) {
        return noteRepository.findById(id).map(n -> {
            Set<Tag> newTags = new HashSet<>();
            for (String name : tags) {
                String cleaned = name.trim();
                if (cleaned.isEmpty()) continue;
                Tag tag = tagRepository.findByName(cleaned).orElseGet(() -> tagRepository.save(new Tag(cleaned)));
                newTags.add(tag);
            }
            n.setTags(newTags);
            return ResponseEntity.ok(noteRepository.save(n));
        }).orElse(ResponseEntity.notFound().build());
    }
}
