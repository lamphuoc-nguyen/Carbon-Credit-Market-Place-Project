package com.carboncredit.repository;

import com.carboncredit.entity.Co2TransferRequest;
import com.carboncredit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface Co2TransferRequestRepository extends JpaRepository<Co2TransferRequest, UUID> {

    List<Co2TransferRequest> findByUser(User user);

    List<Co2TransferRequest> findByStatus(Co2TransferRequest.TransferStatus status);

    List<Co2TransferRequest> findByUserAndStatus(User user, Co2TransferRequest.TransferStatus status);

    @Query("SELECT r FROM Co2TransferRequest r WHERE r.status = 'PENDING' ORDER BY r.createdAt ASC")
    List<Co2TransferRequest> findPendingRequests();

    long countByStatus(Co2TransferRequest.TransferStatus status);

    long countByProcessedByAndStatus(User processedBy, Co2TransferRequest.TransferStatus status);

    @Query("SELECT COUNT(r) FROM Co2TransferRequest r WHERE r.status = 'PENDING' AND r.createdAt < :threshold")
    long countOverduePendingRequests(LocalDateTime threshold);

    List<Co2TransferRequest> findByProcessedBy(User processedBy);
}
