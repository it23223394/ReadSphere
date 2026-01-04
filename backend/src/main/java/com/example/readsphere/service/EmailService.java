package com.example.readsphere.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Email service for sending emails via SMTP
 */
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.email.from:noreply@readsphere.com}")
    private String fromEmail;

    @Value("${app.email.fromName:ReadSphere}")
    private String fromName;

    /**
     * Send password reset email
     * RS-104: Password Reset Flow
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        
        String subject = "Reset Your ReadSphere Password";
        String body = "Hi,\n\n" +
                "You requested to reset your password. Click the link below:\n" +
                resetLink + "\n\n" +
                "This link will expire in 1 hour.\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Thanks,\n" +
                "ReadSphere Team";
        
        sendEmail(toEmail, subject, body);
    }

    /**
     * Send email verification email
     * RS-105: Email Verification
     */
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        String verificationLink = "http://localhost:3000/verify-email?token=" + verificationToken;
        
        String subject = "Verify Your ReadSphere Email";
        String body = "Hi,\n\n" +
                "Welcome to ReadSphere! Please verify your email by clicking the link below:\n" +
                verificationLink + "\n\n" +
                "Thanks,\n" +
                "ReadSphere Team";
        
        sendEmail(toEmail, subject, body);
    }

    /**
     * Generic email sending method
     */
    private void sendEmail(String toEmail, String subject, String body) {
        try {
            if (mailSender == null) {
                // Fallback to console logging if mail sender is not configured
                logEmailToConsole(toEmail, subject, body);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            System.out.println("✓ Email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("✗ Failed to send email to " + toEmail + ": " + e.getMessage());
            // Log to console as fallback
            logEmailToConsole(toEmail, subject, body);
        }
    }

    /**
     * Log email to console (fallback when SMTP is not configured)
     */
    private void logEmailToConsole(String toEmail, String subject, String body) {
        System.out.println("========================================");
        System.out.println("EMAIL (Console Mode - SMTP Not Configured)");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: " + subject);
        System.out.println("========================================");
        System.out.println(body);
        System.out.println("========================================");
    }
}
