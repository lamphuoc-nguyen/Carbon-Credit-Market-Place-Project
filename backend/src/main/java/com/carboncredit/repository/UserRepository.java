package com.carboncredit.repository;

import com.carboncredit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<User> findByRole(User.UserRole role);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByFullName(String fullName);

    @Query(
            value = "SELECT * FROM [User] WHERE role = CAST(:role AS VARCHAR) AND createdAt >= DATEADD(DAY, -30, GETDATE())",
            nativeQuery = true
    )
    List<User> findRecentUsersByRole(@Param("role") User.UserRole role);

    @Query("SELECT u FROM User u WHERE u.email = :input OR u.phone = :input")
    Optional<User> findByEmailOrPhone(String input);

}
