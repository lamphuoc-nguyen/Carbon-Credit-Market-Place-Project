package com.carboncredit.backend.Repository;

import com.carboncredit.backend.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    Optional<Users> findByEmail(String email);
    Optional<Users> findByUsername(String username);

    @Query("SELECT u FROM Users u WHERE u.email = :usernameOrEmail OR u.username = :usernameOrEmail")
    Optional<Users> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);

    Optional<Users> findByProviderAndProviderId(String provider, String providerId);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<Users> findByEmailAndPasswordHash(String email, String passwordHash);
}
