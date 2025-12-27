package com.example.readsphere.service;

import org.springframework.stereotype.Service;

/**
 * Email service for sending emails
 * Note: This is a mock implementation. In production, integrate with:
 * - Spring Mail (JavaMailSender)
 * - SendGrid
 * - AWS SES
 * - Azure Communication Services
 */
@Service
public class EmailService {

    /**
     * Send password reset email
     * RS-104: Password Reset Flow
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        // In production, send actual email with reset link
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        
        // For now, just log the email content
        System.out.println("========================================");
        System.out.println("PASSWORD RESET EMAIL");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: Reset Your ReadSphere Password");
        System.out.println("========================================");
        System.out.println("Hi,");
        System.out.println("");
        System.out.println("You requested to reset your password. Click the link below:");
        System.out.println(resetLink);
        System.out.println("");
        System.out.println("This link will expire in 1 hour.");
        System.out.println("If you didn't request this, please ignore this email.");
        System.out.println("");
        System.out.println("Thanks,");
        System.out.println("ReadSphere Team");
        System.out.println("========================================");
        
        // TODO: Replace with actual email sending
        // Example with Spring Mail:
        // SimpleMailMessage message = new SimpleMailMessage();
        // message.setTo(toEmail);
        // message.setSubject("Reset Your ReadSphere Password");
        // message.setText("Click here to reset: " + resetLink);
        // mailSender.send(message);
    }

    /**
     * Send email verification email
     * RS-105: Email Verification
     */
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        String verificationLink = "http://localhost:3000/verify-email?token=" + verificationToken;
        
        System.out.println("========================================");
        System.out.println("EMAIL VERIFICATION");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: Verify Your ReadSphere Email");
        System.out.println("========================================");
        System.out.println("Hi,");
        System.out.println("");
        System.out.println("Welcome to ReadSphere! Please verify your email by clicking:");
        System.out.println(verificationLink);
        System.out.println("");
        System.out.println("Thanks,");
        System.out.println("ReadSphere Team");
        System.out.println("========================================");
    }
}
