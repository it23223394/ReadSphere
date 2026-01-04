package com.example.readsphere.config;

import com.example.readsphere.model.Book;
import com.example.readsphere.model.BookCatalog;
import com.example.readsphere.model.User;
import com.example.readsphere.repository.BookCatalogRepository;
import com.example.readsphere.repository.BookRepository;
import com.example.readsphere.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, 
                                    BookRepository bookRepository,
                                    BookCatalogRepository catalogRepository) {
        return args -> {
            try {
                // Seed or top-up book catalog
                long catalogCount = catalogRepository.count();
                catalogCount -= pruneFakeExplorerEntries(catalogRepository);
                if (catalogCount == 0) {
                    seedBookCatalog(catalogRepository);
                    System.out.println("✅ Catalog seeded successfully!");
                } else if (catalogCount < 250) {
                    topUpCatalogWithRealTitles(catalogRepository, (int) catalogCount);
                }

                // Seed admin user (idempotent - won't duplicate)
                seedAdminUser(userRepository);

                // Only seed sample user data if database is empty
                if (userRepository.count() > 1) {
                    return;
                }

            // Create a test user
            User user = new User("John Doe", "john@example.com", "password123");
            user.setRole(User.Role.USER);  // Explicitly set USER role
            user = userRepository.save(user);

            // Create sample books for the user (legacy system - keep for backward compatibility)
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
            System.out.println("📖 Books added: 8 user books + " + catalogRepository.count() + " catalog books");
            System.out.println("🎯 Test recommendation: GET http://localhost:8080/api/recommendations/" + user.getId());
            System.out.println("📚 Browse catalog: GET http://localhost:8080/api/catalog");
            } catch (Exception e) {
                System.err.println("❌ Error seeding data: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }

    private void seedBookCatalog(BookCatalogRepository catalogRepository) {
        List<BookCatalog> catalog = new ArrayList<>();

        // Fiction
        catalog.add(new BookCatalog("1984", "George Orwell", "Fiction", 
            "Dystopian novel about totalitarian surveillance and thought control.", 4.7, 328));
        catalog.add(new BookCatalog("To Kill a Mockingbird", "Harper Lee", "Fiction",
            "Classic story of racial injustice in the American South.", 4.8, 336));
        catalog.add(new BookCatalog("The Great Gatsby", "F. Scott Fitzgerald", "Fiction",
            "Jazz Age tale of wealth, love, and the American Dream.", 4.4, 180));
        catalog.add(new BookCatalog("Pride and Prejudice", "Jane Austen", "Fiction",
            "Romantic novel about Elizabeth Bennet and Mr. Darcy.", 4.6, 432));
        catalog.add(new BookCatalog("The Catcher in the Rye", "J.D. Salinger", "Fiction",
            "Coming-of-age story of teenage rebellion and alienation.", 4.0, 277));

        // Fantasy
        catalog.add(new BookCatalog("The Hobbit", "J.R.R. Tolkien", "Fantasy",
            "Bilbo Baggins' adventure with dwarves to reclaim their mountain home.", 4.8, 310));
        catalog.add(new BookCatalog("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "Fantasy",
            "Young wizard discovers his magical heritage and destiny.", 4.9, 309));
        catalog.add(new BookCatalog("The Name of the Wind", "Patrick Rothfuss", "Fantasy",
            "A legendary hero tells his own story of magic and adventure.", 4.6, 662));
        catalog.add(new BookCatalog("A Game of Thrones", "George R.R. Martin", "Fantasy",
            "Political intrigue and war in the Seven Kingdoms of Westeros.", 4.7, 835));
        catalog.add(new BookCatalog("The Way of Kings", "Brandon Sanderson", "Fantasy",
            "Epic fantasy with unique magic systems and world-building.", 4.8, 1007));

        // Sci-Fi
        catalog.add(new BookCatalog("Dune", "Frank Herbert", "Sci-Fi",
            "Desert planet, spice wars, and galactic politics.", 4.6, 688));
        catalog.add(new BookCatalog("Ender's Game", "Orson Scott Card", "Sci-Fi",
            "Child prodigy trained to fight an alien invasion.", 4.7, 324));
        catalog.add(new BookCatalog("The Martian", "Andy Weir", "Sci-Fi",
            "Astronaut stranded on Mars uses science to survive.", 4.8, 369));
        catalog.add(new BookCatalog("Neuromancer", "William Gibson", "Sci-Fi",
            "Cyberpunk classic about hackers and artificial intelligence.", 4.3, 271));
        catalog.add(new BookCatalog("Foundation", "Isaac Asimov", "Sci-Fi",
            "Mathematical prediction of the fall of a galactic empire.", 4.5, 255));

        // Mystery/Thriller
        catalog.add(new BookCatalog("The Girl with the Dragon Tattoo", "Stieg Larsson", "Mystery",
            "Journalist and hacker investigate a decades-old disappearance.", 4.5, 465));
        catalog.add(new BookCatalog("Gone Girl", "Gillian Flynn", "Mystery",
            "Wife disappears on anniversary, husband becomes prime suspect.", 4.2, 422));
        catalog.add(new BookCatalog("The Da Vinci Code", "Dan Brown", "Mystery",
            "Symbologist uncovers conspiracy hidden in religious art.", 4.3, 454));
        catalog.add(new BookCatalog("Sherlock Holmes: The Complete Stories", "Arthur Conan Doyle", "Mystery",
            "Classic detective solves seemingly impossible crimes.", 4.7, 1122));
        catalog.add(new BookCatalog("And Then There Were None", "Agatha Christie", "Mystery",
            "Ten strangers trapped on island, murdered one by one.", 4.6, 272));

        // Self-Help
        catalog.add(new BookCatalog("The 7 Habits of Highly Effective People", "Stephen Covey", "Self-Help",
            "Principles for personal and professional effectiveness.", 4.5, 381));
        catalog.add(new BookCatalog("How to Win Friends and Influence People", "Dale Carnegie", "Self-Help",
            "Timeless advice on relationships and communication.", 4.4, 288));
        catalog.add(new BookCatalog("Atomic Habits", "James Clear", "Self-Help",
            "Proven framework for improving habits and achieving goals.", 4.8, 320));
        catalog.add(new BookCatalog("Deep Work", "Cal Newport", "Self-Help",
            "Rules for focused success in a distracted world.", 4.6, 296));
        catalog.add(new BookCatalog("Mindset", "Carol Dweck", "Self-Help",
            "Growth mindset vs. fixed mindset in learning and success.", 4.5, 320));

        // Business/Finance
        catalog.add(new BookCatalog("The Psychology of Money", "Morgan Housel", "Finance",
            "Timeless lessons on wealth, greed, and happiness.", 4.7, 256));
        catalog.add(new BookCatalog("Rich Dad Poor Dad", "Robert Kiyosaki", "Finance",
            "What the wealthy teach their kids about money.", 4.3, 336));
        catalog.add(new BookCatalog("The Intelligent Investor", "Benjamin Graham", "Finance",
            "Classic guide to value investing and financial wisdom.", 4.6, 640));
        catalog.add(new BookCatalog("Thinking, Fast and Slow", "Daniel Kahneman", "Business",
            "Two systems of thought: intuitive and deliberate.", 4.4, 499));
        catalog.add(new BookCatalog("Zero to One", "Peter Thiel", "Business",
            "Notes on startups and building the future.", 4.5, 224));

        // Biography/Memoir
        catalog.add(new BookCatalog("Steve Jobs", "Walter Isaacson", "Biography",
            "Authorized biography of Apple's visionary co-founder.", 4.6, 656));
        catalog.add(new BookCatalog("Educated", "Tara Westover", "Memoir",
            "Woman escapes survivalist upbringing through education.", 4.7, 334));
        catalog.add(new BookCatalog("Born a Crime", "Trevor Noah", "Memoir",
            "Growing up in apartheid South Africa as a mixed-race child.", 4.8, 304));
        catalog.add(new BookCatalog("The Diary of a Young Girl", "Anne Frank", "Biography",
            "Jewish girl's diary while hiding from Nazis in Amsterdam.", 4.7, 283));
        catalog.add(new BookCatalog("Becoming", "Michelle Obama", "Memoir",
            "Former First Lady's journey from South Side Chicago to the White House.", 4.7, 448));

        // Science
        catalog.add(new BookCatalog("Sapiens", "Yuval Noah Harari", "Science",
            "A brief history of humankind from Stone Age to modern age.", 4.6, 443));
        catalog.add(new BookCatalog("A Brief History of Time", "Stephen Hawking", "Science",
            "Exploration of cosmology, black holes, and the universe.", 4.4, 256));
        catalog.add(new BookCatalog("The Selfish Gene", "Richard Dawkins", "Science",
            "Gene-centered view of evolution and natural selection.", 4.5, 360));
        catalog.add(new BookCatalog("Cosmos", "Carl Sagan", "Science",
            "Exploration of space, time, and the human condition.", 4.7, 365));
        catalog.add(new BookCatalog("The Origin of Species", "Charles Darwin", "Science",
            "Foundational work on evolution and natural selection.", 4.4, 502));

        // Romance
        catalog.add(new BookCatalog("The Notebook", "Nicholas Sparks", "Romance",
            "Elderly man reads to his wife from notebook about their love story.", 4.4, 227));
        catalog.add(new BookCatalog("Me Before You", "Jojo Moyes", "Romance",
            "Caregiver falls for paralyzed man with different views on life.", 4.5, 369));
        catalog.add(new BookCatalog("The Time Traveler's Wife", "Audrey Niffenegger", "Romance",
            "Love story complicated by involuntary time travel.", 4.3, 528));
        catalog.add(new BookCatalog("Outlander", "Diana Gabaldon", "Romance",
            "World War II nurse transported to 18th century Scotland.", 4.6, 850));
        catalog.add(new BookCatalog("The Fault in Our Stars", "John Green", "Romance",
            "Two cancer patients fall in love while confronting mortality.", 4.5, 313));

        // Horror
        catalog.add(new BookCatalog("The Shining", "Stephen King", "Horror",
            "Family isolated in haunted hotel during winter.", 4.5, 447));
        catalog.add(new BookCatalog("Dracula", "Bram Stoker", "Horror",
            "Classic vampire tale of Count Dracula's reign of terror.", 4.3, 418));
        catalog.add(new BookCatalog("Frankenstein", "Mary Shelley", "Horror",
            "Scientist creates life but can't control his monstrous creation.", 4.2, 280));
        catalog.add(new BookCatalog("It", "Stephen King", "Horror",
            "Children battle shape-shifting evil entity in their town.", 4.6, 1138));
        catalog.add(new BookCatalog("The Haunting of Hill House", "Shirley Jackson", "Horror",
            "Paranormal investigators study supposedly haunted mansion.", 4.4, 246));

        // Import additional real titles from Open Library to reach 250+
        int desired = Math.max(0, 250 - catalog.size());
        if (desired > 0) {
            int added = addFromOpenLibrary(catalog, desired, catalog);
            System.out.println("🌐 Open Library imports added: " + added);
        }

        catalogRepository.saveAll(catalog);
        System.out.println("📚 Seeded " + catalog.size() + " books into catalog");
    }

    private void topUpCatalogWithRealTitles(BookCatalogRepository catalogRepository, int existingCount) {
        try {
            int target = 250;
            int needed = Math.max(0, target - existingCount);
            if (needed == 0) {
                System.out.println("ℹ️ Catalog already has " + existingCount + " books. No top-up needed.");
                return;
            }
            List<BookCatalog> existing = catalogRepository.findAll();
            List<BookCatalog> additions = new ArrayList<>();
            int added = addFromOpenLibrary(additions, needed, existing);
            if (added == 0) {
                System.err.println("⚠️ Open Library unavailable; skipping fabricated entries per request.");
            }
            if (!additions.isEmpty()) {
                catalogRepository.saveAll(additions);
                System.out.println("✅ Top-up added " + additions.size() + " real titles (from " + existingCount + " to " + (existingCount + additions.size()) + ")");
            }
        } catch (Exception e) {
            System.err.println("❌ Catalog top-up failed: " + e.getMessage());
        }
    }

    /**
     * Import real titles from Open Library subjects and add to the provided list.
     */
    private int addFromOpenLibrary(List<BookCatalog> catalog, int desiredAdditional, List<BookCatalog> existingForDedupe) {
        String[] subjects = new String[] {
            "fiction", "fantasy", "science_fiction", "mystery",
            "romance", "horror", "history", "biography",
            "business", "psychology", "young_adult", "science"
        };

        RestTemplate rest = new RestTemplate();
        ObjectMapper mapper = new ObjectMapper();
        Set<String> seen = new HashSet<>();
        for (BookCatalog b : existingForDedupe) {
            seen.add((b.getTitle() + "|" + b.getAuthor()).toLowerCase());
        }
        for (BookCatalog b : catalog) {
            seen.add((b.getTitle() + "|" + b.getAuthor()).toLowerCase());
        }

        AtomicInteger added = new AtomicInteger(0);
        int perSubject = Math.max(10, (desiredAdditional / subjects.length) + 5);

        for (String subject : subjects) {
            if (added.get() >= desiredAdditional) break;
            String url = "https://openlibrary.org/subjects/" + subject + ".json?limit=" + perSubject;
            try {
                String body = rest.getForObject(url, String.class);
                JsonNode root = mapper.readTree(body);
                JsonNode works = root.path("works");
                if (works.isArray()) {
                    for (JsonNode w : works) {
                        if (added.get() >= desiredAdditional) break;
                        String title = w.path("title").asText("");
                        JsonNode authors = w.path("authors");
                        String author = "Unknown";
                        if (authors.isArray() && authors.size() > 0) {
                            author = authors.get(0).path("name").asText("Unknown");
                        }
                        if (title.isBlank()) continue;
                        String key = (title + "|" + author).toLowerCase();
                        if (seen.contains(key)) continue;
                        seen.add(key);

                        String description = "Imported from Open Library subject: " + subject.replace('_', ' ');
                        double rating = 0.0;
                        int pages = 0;
                        String genre = subject.replace('_', ' ');

                        catalog.add(new BookCatalog(title, author, genre, description, rating, pages));
                        added.incrementAndGet();
                    }
                }
            } catch (Exception ex) {
                System.err.println("⚠️ Open Library fetch failed for subject '" + subject + "': " + ex.getMessage());
            }
        }
        return added.get();
    }

    private int pruneFakeExplorerEntries(BookCatalogRepository catalogRepository) {
        try {
            List<BookCatalog> all = catalogRepository.findAll();
            List<BookCatalog> fake = new ArrayList<>();
            for (BookCatalog b : all) {
                String title = b.getTitle() == null ? "" : b.getTitle();
                String author = b.getAuthor() == null ? "" : b.getAuthor();
                if (author.equalsIgnoreCase("Library Team") && title.startsWith("Explorer")) {
                    fake.add(b);
                }
            }
            if (!fake.isEmpty()) {
                catalogRepository.deleteAll(fake);
                System.out.println("🧹 Removed " + fake.size() + " fabricated Explorer entries.");
            }
            return fake.size();
        } catch (Exception e) {
            System.err.println("⚠️ Failed to prune fake entries: " + e.getMessage());
            return 0;
        }
    }

    private void seedAdminUser(UserRepository userRepository) {
        // Check if admin already exists
        if (userRepository.findByEmail("admin@readsphere.com").isPresent()) {
            return;
        }

        // Create admin user
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User admin = new User();
        admin.setName("Administrator");
        admin.setEmail("admin@readsphere.com");
        admin.setPassword(encoder.encode("Admin@123"));
        admin.setRole(User.Role.ADMIN);
        admin.setEmailVerified(true);
        admin.setTheme("light");
        admin.setNotificationsEnabled(true);

        userRepository.save(admin);
        System.out.println("✅ Admin user created");
        System.out.println("   Email: admin@readsphere.com");
        System.out.println("   Password: Admin@123");
        System.out.println("   ⚠️  Change in production!");
    }
}
