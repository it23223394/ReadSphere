package com.example.readsphere.service;

import com.example.readsphere.dto.RegisterRequest;
import com.example.readsphere.dto.LoginRequest;
import com.example.readsphere.dto.AuthResponse;
import com.example.readsphere.dto.UpdateProfileRequest;
import com.example.readsphere.dto.UserProfileResponse;
import com.example.readsphere.dto.ChangePasswordRequest;
import com.example.readsphere.dto.PasswordResetRequest;
import com.example.readsphere.dto.ResetPasswordConfirmRequest;
import com.example.readsphere.dto.UserSettingsRequest;
import com.example.readsphere.dto.UserSettingsResponse;
import com.example.readsphere.model.User;
import com.example.readsphere.repository.UserRepository;
import com.example.readsphere.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    // Email validation regex pattern
    private static final String EMAIL_PATTERN = 
            "^[A-Za-z0-9+_.-]+@(.+)$";
    private static final Pattern pattern = Pattern.compile(EMAIL_PATTERN);

    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return pattern.matcher(email).matches();
    }

    /**
     * Register a new user
     * RS-101: User Registration API
     */
    public AuthResponse registerUser(RegisterRequest request) {
        // Validate name
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        // Validate email is not empty
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        // Validate email format
        if (!isValidEmail(request.getEmail())) {
            throw new IllegalArgumentException("Please provide a valid email address");
        }

        // Validate password is not empty
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        // Check password strength (at least 6 characters)
        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        // Check if passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create new user with hashed password
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Set role (default to USER if not specified or invalid)
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            user.setRole(User.Role.ADMIN);
        } else {
            user.setRole(User.Role.USER);
        }

        // Save to database
        User savedUser = userRepository.save(user);

        // Generate tokens with role
        String token = jwtTokenProvider.generateToken(savedUser.getId(), savedUser.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getId());

        return new AuthResponse(
                savedUser.getId(),
                token,
                refreshToken,
                "User registered successfully",
                savedUser.getRole().name()
        );
    }

    /**
     * Login user with email and password
     * RS-102: User Login with JWT
     */
    public AuthResponse loginUser(LoginRequest request) {
        // Validate input
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userOptional.get();

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Generate tokens with role
        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(
                user.getId(),
                token,
                refreshToken,
                "Login successful",
                user.getRole().name()
        );
    }

    /**
     * Get user by ID
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    /**
     * Get user by email
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get user profile by ID
     * RS-103: User Profile Management
     */
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                "Profile retrieved successfully"
        );
    }

    /**
     * Update user profile
     * RS-103: User Profile Management
     */
    public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate name
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }

        // Validate and update email if provided
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            // Check if email format is valid
            if (!isValidEmail(request.getEmail())) {
                throw new IllegalArgumentException("Please provide a valid email address");
            }

            // Check if email is already taken by another user
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                throw new IllegalArgumentException("Email already in use by another account");
            }

            user.setEmail(request.getEmail().trim());
        }

        User updatedUser = userRepository.save(user);

        return new UserProfileResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                "Profile updated successfully"
        );
    }

    /**
     * Change user password
     * RS-103: User Profile Management
     */
    public UserProfileResponse changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate old password
        if (request.getOldPassword() == null || request.getOldPassword().isEmpty()) {
            throw new IllegalArgumentException("Current password is required");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Validate new password
        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }

        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        // Check if passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                "Password changed successfully"
        );
    }

    /**
     * Request password reset - send reset token via email
     * RS-104: Password Reset Flow
     */
    public Map<String, String> requestPasswordReset(PasswordResetRequest request) {
        // Validate email
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }

        // Find user by email
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        
        // Always return success message for security (don't reveal if email exists)
        Map<String, String> response = new HashMap<>();
        response.put("message", "If the email exists, a password reset link has been sent");

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // Generate unique reset token
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            userRepository.save(user);

            // Send email with reset link
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        }

        return response;
    }

    /**
     * Confirm password reset with token
     * RS-104: Password Reset Flow
     */
    public Map<String, String> resetPassword(ResetPasswordConfirmRequest request) {
        // Validate token
        if (request.getToken() == null || request.getToken().trim().isEmpty()) {
            throw new IllegalArgumentException("Reset token is required");
        }

        // Find user by reset token
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        // Validate new password
        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }

        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        // Check if passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Update password and clear reset token
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return response;
    }

    /**
     * Send email verification
     * RS-105: Email Verification
     */
    public Map<String, String> sendEmailVerification(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        // Generate unique verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationToken);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Verification email sent");
        return response;
    }

    /**
     * Verify email with token
     * RS-105: Email Verification
     */
    public Map<String, String> verifyEmail(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Verification token is required");
        }

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully");
        return response;
    }

    /**
     * Get user settings
     * RS-106: User Settings & Preferences
     */
    public UserSettingsResponse getUserSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserSettingsResponse(
                user.getId(),
                user.getReadingGoalBooksPerMonth(),
                user.getReadingGoalPagesPerDay(),
                user.getTheme(),
                user.getNotificationsEnabled(),
                "Settings retrieved successfully"
        );
    }

    /**
     * Update user settings
     * RS-106: User Settings & Preferences
     */
    public UserSettingsResponse updateUserSettings(Long userId, UserSettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update reading goals
        if (request.getReadingGoalBooksPerMonth() != null) {
            if (request.getReadingGoalBooksPerMonth() < 0) {
                throw new IllegalArgumentException("Reading goal cannot be negative");
            }
            user.setReadingGoalBooksPerMonth(request.getReadingGoalBooksPerMonth());
        }

        if (request.getReadingGoalPagesPerDay() != null) {
            if (request.getReadingGoalPagesPerDay() < 0) {
                throw new IllegalArgumentException("Reading goal cannot be negative");
            }
            user.setReadingGoalPagesPerDay(request.getReadingGoalPagesPerDay());
        }

        // Update theme
        if (request.getTheme() != null) {
            if (!request.getTheme().equals("light") && !request.getTheme().equals("dark")) {
                throw new IllegalArgumentException("Theme must be 'light' or 'dark'");
            }
            user.setTheme(request.getTheme());
        }

        // Update notifications
        if (request.getNotificationsEnabled() != null) {
            user.setNotificationsEnabled(request.getNotificationsEnabled());
        }

        User updatedUser = userRepository.save(user);

        return new UserSettingsResponse(
                updatedUser.getId(),
                updatedUser.getReadingGoalBooksPerMonth(),
                updatedUser.getReadingGoalPagesPerDay(),
                updatedUser.getTheme(),
                updatedUser.getNotificationsEnabled(),
                "Settings updated successfully"
        );
    }
}
