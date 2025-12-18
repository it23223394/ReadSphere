package com.example.readsphere.repository;

import com.example.readsphere.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Find user by email address
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find user by password reset token
     */
    Optional<User> findByResetToken(String resetToken);
    
    /**
     * Find user by email verification token
     */
    Optional<User> findByVerificationToken(String verificationToken);
}
