package com.example.readsphere.service.storage;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.BlobHttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
public class AzureBlobService {
    private final BlobServiceClient blobServiceClient;
    private final String containerName;

    public AzureBlobService(@Value("${azure.storage.connection-string:}") String connectionString,
                            @Value("${azure.storage.container-name:book-covers}") String containerName) {
        this.blobServiceClient = (connectionString == null || connectionString.isEmpty()) ? null : new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
        this.containerName = containerName;
    }

    public String uploadCover(MultipartFile file) throws Exception {
        if (blobServiceClient == null) {
            throw new IllegalStateException("Azure Blob Storage not configured");
        }
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        if (!containerClient.exists()) containerClient.create();
        String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
        BlobClient blobClient = containerClient.getBlobClient(filename);
        try (InputStream is = file.getInputStream()) {
            blobClient.upload(is, file.getSize(), true);
            BlobHttpHeaders headers = new BlobHttpHeaders().setContentType(file.getContentType());
            blobClient.setHttpHeaders(headers);
        }
        return blobClient.getBlobUrl();
    }
}
