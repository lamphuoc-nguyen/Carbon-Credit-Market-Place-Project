package com.carboncredit.backend.Repository;

import com.carboncredit.backend.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    Optional<Users> findByEmail(String email);
    Optional<Users> findByProviderAndProviderId(String provider, String providerId);
    boolean existsByEmail(String email);
    Optional<Users> findByEmailAndPasswordHash(String email, String passwordHash);
}

