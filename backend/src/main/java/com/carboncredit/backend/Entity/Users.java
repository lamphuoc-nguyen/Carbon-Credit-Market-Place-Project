// java
package com.carboncredit.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userID")
    private Integer userID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roleID", nullable = true) // Allow null for incomplete profiles
    private Roles role;

    @Column(name = "email", length = 190, nullable = false, unique = true)
    private String email;

    @Column(name = "username", length = 50, nullable = true, unique = true)
    private String username;

    @Column(name = "passwordHash", length = 255, nullable = true)
    private String passwordHash;

    @Column(name = "name", length = 120, nullable = false)
    private String name;

    @Column(name = "phone", length = 32)
    private String phone;

    @Column(name = "profile_status", nullable = false)
    private Integer profileStatus = 0; // 0 = incomplete, 1 = complete

    @Column(name = "provider", length = 50, nullable = false)
    private String provider = "LOCAL";

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}