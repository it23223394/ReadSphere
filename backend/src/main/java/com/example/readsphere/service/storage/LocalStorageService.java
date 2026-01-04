package com.example.readsphere.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalStorageService {

    private final Path uploadRoot;

    public LocalStorageService(@Value("${uploads.dir:uploads}") String uploadsDir) {
        this.uploadRoot = Paths.get(uploadsDir).toAbsolutePath().normalize();
    }

    public String saveQuoteImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        Files.createDirectories(uploadRoot.resolve("quotes"));

        String originalFilename = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "quote";
        String cleaned = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String filename = UUID.randomUUID() + "-" + cleaned;
        Path target = uploadRoot.resolve("quotes").resolve(filename).normalize();

        Files.copy(file.getInputStream(), target);

        // Expose via /files/** mapping in StaticResourceConfig
        return "/files/quotes/" + filename;
    }
}
