package com.example.readsphere.dto;

public class ImportResult {
    private int imported;
    private int failed;
    private String message;

    public ImportResult() {}
    public ImportResult(int imported, int failed, String message) {
        this.imported = imported; this.failed = failed; this.message = message;
    }

    public int getImported() { return imported; }
    public void setImported(int imported) { this.imported = imported; }
    public int getFailed() { return failed; }
    public void setFailed(int failed) { this.failed = failed; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
