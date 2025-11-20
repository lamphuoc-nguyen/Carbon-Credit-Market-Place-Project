package com.carboncredit.controller;

import com.carboncredit.dto.ApiResponse;
import com.carboncredit.dto.Co2TransferRequestDTO;
import com.carboncredit.dto.CreateTransferRequestDTO;
import com.carboncredit.entity.User;
import com.carboncredit.service.Co2TransferService;
import com.carboncredit.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/co2-transfer")
@RequiredArgsConstructor
public class Co2TransferController {

    private final Co2TransferService co2TransferService;
    private final UserService userService;

    /**
     * Create a new CO2 to credit transfer request
     */
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Co2TransferRequestDTO>> createTransferRequest(
            @RequestBody CreateTransferRequestDTO requestDTO,
            Authentication authentication) {

        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            log.info("User {} creating transfer request for {} kg CO2", user.getUsername(), requestDTO.getCo2Amount());

            Co2TransferRequestDTO result = co2TransferService.createTransferRequest(user, requestDTO);

            return ResponseEntity.ok(ApiResponse.success(
                "Transfer request created successfully",
                result
            ));
        } catch (Exception e) {
            log.error("Error creating transfer request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all transfer requests for the current user
     */
    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<Co2TransferRequestDTO>>> getUserTransferRequests(
            Authentication authentication) {

        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Co2TransferRequestDTO> requests = co2TransferService.getUserTransferRequests(user);

            return ResponseEntity.ok(ApiResponse.success(
                "Transfer requests retrieved successfully",
                requests
            ));
        } catch (Exception e) {
            log.error("Error retrieving transfer requests: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get transfer request statistics for user dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getTransferRequestStats(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            var stats = co2TransferService.getTransferRequestStats(user);

            return ResponseEntity.ok(ApiResponse.success(
                "Transfer request statistics retrieved successfully",
                stats
            ));
        } catch (Exception e) {
            log.error("Error retrieving transfer request statistics: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cancel a pending transfer request (user can cancel their own pending requests)
     */
    @DeleteMapping("/{requestId}")
    public ResponseEntity<ApiResponse<String>> cancelTransferRequest(
            @PathVariable UUID requestId,
            Authentication authentication) {

        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            log.info("User {} attempting to cancel transfer request {}", user.getUsername(), requestId);

            // TODO: Implement cancel functionality in service
            // For now, return not implemented
            return ResponseEntity.ok(ApiResponse.error(
                "Cancel functionality not implemented yet"
            ));
        } catch (Exception e) {
            log.error("Error cancelling transfer request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
