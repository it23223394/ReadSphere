package com.example.readsphere.config;

import com.example.readsphere.model.Book;
import com.example.readsphere.model.User;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, BookRepository bookRepository) {
        return args -> {
            // Only seed if database is empty
            if (userRepository.count() > 0) {
                return;
            }

            // Create a test user
            User user = new User("John Doe", "john@example.com", "password123");
            user = userRepository.save(user);

            // Create sample books for the user
            Book book1 = new Book("Atomic Habits", "James Clear", "Self-Help", 320, 320, "READ");
            book1.setRating(5);
            book1.setUser(user);

            Book book2 = new Book("Deep Work", "Cal Newport", "Self-Help", 296, 296, "READ");
            book2.setRating(5);
            book2.setUser(user);

            Book book3 = new Book("The Psychology of Money", "Morgan Housel", "Finance", 256, 256, "READ");
            book3.setRating(4);
            book3.setUser(user);

            Book book4 = new Book("Can't Hurt Me", "David Goggins", "Self-Help", 364, 150, "READING");
            book4.setRating(4);
            book4.setUser(user);

            Book book5 = new Book("The Subtle Art of Not Giving a F*ck", "Mark Manson", "Self-Help", 224, 0, "WANT_TO_READ");
            book5.setRating(null);
            book5.setUser(user);

            Book book6 = new Book("Rich Dad Poor Dad", "Robert Kiyosaki", "Finance", 336, 0, "WANT_TO_READ");
            book6.setRating(null);
            book6.setUser(user);

            Book book7 = new Book("The 4-Hour Workweek", "Tim Ferriss", "Self-Help", 416, 0, "WANT_TO_READ");
            book7.setRating(null);
            book7.setUser(user);

            Book book8 = new Book("Think and Grow Rich", "Napoleon Hill", "Self-Help", 238, 0, "WANT_TO_READ");
            book8.setRating(null);
            book8.setUser(user);

            bookRepository.save(book1);
            bookRepository.save(book2);
            bookRepository.save(book3);
            bookRepository.save(book4);
            bookRepository.save(book5);
            bookRepository.save(book6);
            bookRepository.save(book7);
            bookRepository.save(book8);

            System.out.println("✅ Sample data seeded successfully!");
            System.out.println("📚 User created: " + user.getName() + " (ID: " + user.getId() + ")");
            System.out.println("📖 Books added: 8 books");
            System.out.println("🎯 Test recommendation: GET http://localhost:8080/api/recommendations/" + user.getId());
        };
    }
}
