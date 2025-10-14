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

    @ManyToOne
    @JoinColumn(name = "roleID", nullable = false)
    private Roles role;

    @Column(name = "email", length = 190, nullable = false, unique = true)
    private String email;

    @Column(name = "passwordHash", length = 255, nullable = true)
    private String passwordHash;

    @Column(name = "name", length = 120, nullable = false)
    private String name;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "phone", length = 32)
    private String phone;

    @Column(name = "provider", length = 50, nullable = false)
    private String provider = "LOCAL";

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;
}

