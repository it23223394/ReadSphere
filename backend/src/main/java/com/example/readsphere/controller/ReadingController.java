package com.example.readsphere.controller;

import com.example.readsphere.dto.ReadingLogRequest;
import com.example.readsphere.model.Book;
import com.example.readsphere.model.ReadingLog;
import com.example.readsphere.model.User;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.repository.ReadingLogRepository;
import com.example.readsphere.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/reading")
@CrossOrigin(origins = "http://localhost:3000")
public class ReadingController {

    private final ReadingLogRepository logRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public ReadingController(ReadingLogRepository logRepository, UserRepository userRepository, BookRepository bookRepository) {
        this.logRepository = logRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    @PostMapping("/logs/user/{userId}")
    public ResponseEntity<?> addLog(@PathVariable Long userId, @Validated @RequestBody ReadingLogRequest req) {
        Optional<User> u = userRepository.findById(userId);
        Optional<Book> b = bookRepository.findById(req.getBookId());
        if (u.isEmpty() || b.isEmpty()) return ResponseEntity.badRequest().body("Invalid userId or bookId");
        LocalDate date = Optional.ofNullable(req.getDate()).orElse(LocalDate.now());
        ReadingLog saved = logRepository.save(new ReadingLog(u.get(), b.get(), req.getPages(), date));
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> summary(@RequestParam Long userId, @RequestParam(defaultValue = "weekly") String range) {
        LocalDate today = LocalDate.now();
        int days = range.equalsIgnoreCase("monthly") ? 30 : 7;
        LocalDate from = today.minusDays(days - 1);
        List<ReadingLog> logs = logRepository.findByUserIdAndDateBetweenOrderByDateAsc(userId, from, today);
        Map<LocalDate, Integer> byDay = new LinkedHashMap<>();
        for (int i = 0; i < days; i++) byDay.put(from.plusDays(i), 0);
        for (ReadingLog rl : logs) {
            byDay.put(rl.getDate(), byDay.getOrDefault(rl.getDate(), 0) + rl.getPages());
        }
        List<Map<String, Object>> out = new ArrayList<>();
        byDay.forEach((d, pages) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("date", d.toString());
            m.put("pages", pages);
            out.add(m);
        });
        return ResponseEntity.ok(out);
    }

    @GetMapping("/streak")
    public ResponseEntity<?> streak(@RequestParam Long userId) {
        List<ReadingLog> logs = logRepository.findByUserIdOrderByDateDesc(userId);
        Set<LocalDate> days = new HashSet<>();
        for (ReadingLog rl : logs) if (rl.getPages() > 0) days.add(rl.getDate());
        LocalDate today = LocalDate.now();
        int current = 0, longest = 0;
        // compute longest by walking backwards up to 365 days for simplicity
        int span = 365;
        int run = 0;
        for (int i = 0; i < span; i++) {
            LocalDate d = today.minusDays(i);
            if (days.contains(d)) {
                run++;
                if (i == 0) current = run; // starts from today backwards
                if (run > longest) longest = run;
            } else {
                run = 0;
            }
        }
        Map<String, Integer> resp = new HashMap<>();
        resp.put("currentStreak", current);
        resp.put("longestStreak", longest);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/timeline")
    public ResponseEntity<?> timeline(@RequestParam Long userId) {
        List<ReadingLog> logs = logRepository.findByUserIdOrderByDateDesc(userId);
        return ResponseEntity.ok(logs);
    }
}
