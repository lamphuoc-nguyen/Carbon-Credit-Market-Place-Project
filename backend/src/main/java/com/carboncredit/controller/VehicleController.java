package com.carboncredit.controller;

import com.carboncredit.dto.ApiResponse;
import com.carboncredit.dto.VehicleDTO;
import com.carboncredit.entity.User;
import com.carboncredit.entity.Vehicle;
import com.carboncredit.exception.ResourceNotFoundException;
import com.carboncredit.service.UserService;
import com.carboncredit.service.VehicleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST Controller for Vehicle Management
 * Handles vehicle CRUD operations
 * Base URL: /api/vehicles
 */
@Slf4j
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;
    private final UserService userService;

    /**
     * Create new vehicle
     * POST /api/vehicles
     *
     * @param vehicleDTO Vehicle data
     * @param authentication Current authenticated user
     * @return Created vehicle with 201 status
     *
     * Request Body Example:
     * {
     *   "userId": "uuid",
     *   "vin": "1HGBH41JXMN109186",
     *   "model": "Tesla Model 3",
     *   "registrationDate": "2023-01-15"
     * }
     */
    @PostMapping
    @PreAuthorize("hasRole('EV_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VehicleDTO>> createVehicle(
            @Valid @RequestBody VehicleDTO vehicleDTO,
            Authentication authentication) {

        log.info("Creating new vehicle for user: {}", authentication.getName());

        try {
            // Get current user
            User currentUser = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // If not admin, user can only create vehicle for themselves
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)) {
                if (vehicleDTO.getUserId() != null && !vehicleDTO.getUserId().equals(currentUser.getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.<VehicleDTO>builder()
                                    .success(false)
                                    .message("You can only create vehicles for yourself")
                                    .build());
                }
                vehicleDTO.setUserId(currentUser.getId());
            }

            // Get user for vehicle
            User vehicleOwner = userService.findById(vehicleDTO.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + vehicleDTO.getUserId()));

            // Create Vehicle entity
            Vehicle vehicle = new Vehicle();
            vehicle.setUser(vehicleOwner);
            vehicle.setVin(vehicleDTO.getVin());
            vehicle.setModel(vehicleDTO.getModel());
            vehicle.setRegistrationDate(vehicleDTO.getRegistrationDate());

            Vehicle createdVehicle = vehicleService.createVehicle(vehicle);
            VehicleDTO responseDTO = new VehicleDTO(createdVehicle);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Vehicle created successfully", responseDTO));
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<VehicleDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Error creating vehicle: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<VehicleDTO>builder()
                            .success(false)
                            .message("Failed to create vehicle: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get all vehicles
     * GET /api/vehicles
     *
     * @return List of all vehicles
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CVA')")
    public ResponseEntity<ApiResponse<List<VehicleDTO>>> getAllVehicles() {
        log.info("Fetching all vehicles");

        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        List<VehicleDTO> vehicleDTOs = vehicles.stream()
                .map(VehicleDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehicleDTOs));
    }

    /**
     * Get vehicle by ID
     * GET /api/vehicles/{id}
     *
     * @param id Vehicle ID
     * @param authentication Current authenticated user
     * @return Vehicle data
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDTO>> getVehicleById(
            @PathVariable UUID id,
            Authentication authentication) {

        log.info("Fetching vehicle: {}", id);

        try {
            Vehicle vehicle = vehicleService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));

            // Get current user
            User currentUser = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if user has permission to view this vehicle
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)
                    && !currentUser.getRole().equals(User.UserRole.CVA)
                    && !vehicle.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.<VehicleDTO>builder()
                                .success(false)
                                .message("You don't have permission to view this vehicle")
                                .build());
            }

            VehicleDTO vehicleDTO = new VehicleDTO(vehicle);
            return ResponseEntity.ok(ApiResponse.success(vehicleDTO));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<VehicleDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * Get vehicles by current user
     * GET /api/vehicles/my-vehicles
     *
     * @param authentication Current authenticated user
     * @return List of user's vehicles
     */
    @GetMapping("/my-vehicles")
    public ResponseEntity<ApiResponse<List<VehicleDTO>>> getMyVehicles(Authentication authentication) {
        log.info("Fetching vehicles for user: {}", authentication.getName());

        User currentUser = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Vehicle> vehicles = vehicleService.findByUserId(currentUser.getId());
        List<VehicleDTO> vehicleDTOs = vehicles.stream()
                .map(VehicleDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("User vehicles retrieved successfully", vehicleDTOs));
    }

    /**
     * Get vehicles by user ID
     * GET /api/vehicles/user/{userId}
     *
     * @param userId User ID
     * @return List of vehicles for the user
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CVA')")
    public ResponseEntity<ApiResponse<List<VehicleDTO>>> getVehiclesByUserId(@PathVariable UUID userId) {
        log.info("Fetching vehicles for user ID: {}", userId);

        List<Vehicle> vehicles = vehicleService.findByUserId(userId);
        List<VehicleDTO> vehicleDTOs = vehicles.stream()
                .map(VehicleDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("User vehicles retrieved successfully", vehicleDTOs));
    }

    /**
     * Get vehicle by VIN
     * GET /api/vehicles/vin/{vin}
     *
     * @param vin Vehicle Identification Number
     * @return Vehicle data
     */
    @GetMapping("/vin/{vin}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CVA')")
    public ResponseEntity<ApiResponse<VehicleDTO>> getVehicleByVin(@PathVariable String vin) {
        log.info("Fetching vehicle by VIN: {}", vin);

        try {
            Vehicle vehicle = vehicleService.findByVin(vin)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with VIN: " + vin));

            VehicleDTO vehicleDTO = new VehicleDTO(vehicle);
            return ResponseEntity.ok(ApiResponse.success(vehicleDTO));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<VehicleDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * Update vehicle
     * PUT /api/vehicles/{id}
     *
     * @param id Vehicle ID
     * @param vehicleDTO Updated vehicle data
     * @param authentication Current authenticated user
     * @return Updated vehicle data
     *
     * Request Body Example:
     * {
     *   "vin": "1HGBH41JXMN109186",
     *   "model": "Tesla Model 3 Performance",
     *   "registrationDate": "2023-01-15"
     * }
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDTO>> updateVehicle(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleDTO vehicleDTO,
            Authentication authentication) {

        log.info("Updating vehicle: {}", id);

        try {
            Vehicle existingVehicle = vehicleService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));

            // Get current user
            User currentUser = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if user has permission to update this vehicle
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)
                    && !existingVehicle.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.<VehicleDTO>builder()
                                .success(false)
                                .message("You don't have permission to update this vehicle")
                                .build());
            }

            // Update fields
            if (vehicleDTO.getVin() != null && !vehicleDTO.getVin().equals(existingVehicle.getVin())) {
                // Check if new VIN already exists
                if (vehicleService.findByVin(vehicleDTO.getVin()).isPresent()) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.<VehicleDTO>builder()
                                    .success(false)
                                    .message("Vehicle with this VIN already exists")
                                    .build());
                }
                existingVehicle.setVin(vehicleDTO.getVin());
            }
            if (vehicleDTO.getModel() != null) {
                existingVehicle.setModel(vehicleDTO.getModel());
            }
            if (vehicleDTO.getRegistrationDate() != null) {
                existingVehicle.setRegistrationDate(vehicleDTO.getRegistrationDate());
            }

            Vehicle updatedVehicle = vehicleService.updateVehicle(existingVehicle);
            VehicleDTO responseDTO = new VehicleDTO(updatedVehicle);

            return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", responseDTO));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<VehicleDTO>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Error updating vehicle: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<VehicleDTO>builder()
                            .success(false)
                            .message("Failed to update vehicle: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Delete vehicle
     * DELETE /api/vehicles/{id}
     *
     * @param id Vehicle ID
     * @param authentication Current authenticated user
     * @return Success message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @PathVariable UUID id,
            Authentication authentication) {

        log.info("Deleting vehicle: {}", id);

        try {
            Vehicle vehicle = vehicleService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));

            // Get current user
            User currentUser = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Check if user has permission to delete this vehicle
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)
                    && !vehicle.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.<Void>builder()
                                .success(false)
                                .message("You don't have permission to delete this vehicle")
                                .build());
            }

            vehicleService.deleteVehicle(id);
            return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully", null));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Error deleting vehicle: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Failed to delete vehicle: " + e.getMessage())
                            .build());
        }
    }
}
