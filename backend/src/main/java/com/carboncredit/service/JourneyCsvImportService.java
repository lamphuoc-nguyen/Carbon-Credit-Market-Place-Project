package com.carboncredit.service;

import com.carboncredit.dto.ImportCSVResponse;
import com.carboncredit.entity.JourneyData;
import com.carboncredit.entity.User;
import com.carboncredit.entity.Vehicle;
import com.carboncredit.repository.JourneyDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JourneyCsvImportService {

    private final JourneyDataService journeyDataService;
    private final VehicleService vehicleService; // make sure this service exists in your project
    private final WalletService walletService;
    private final JourneyDataRepository journeyDataRepository;

    private static final DateTimeFormatter ISO_DT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public ImportCSVResponse importCsv(MultipartFile file, User user) {
        int processed = 0, success = 0, failed = 0;
        List<String> createdIds = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try {
            try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
                 CSVParser parser = CSVFormat.DEFAULT
                         .withFirstRecordAsHeader()
                         .withIgnoreEmptyLines(true)
                         .withTrim()
                         .parse(reader)) {

                BigDecimal totalValidCo2 = BigDecimal.ZERO;

                for (CSVRecord r : parser) {
                    processed++;
                    try {
                        JourneyData jd = new JourneyData();
                        jd.setUser(user);

                        // vehicleId is optional - use user's first vehicle if not provided
                        String vehicleIdStr = r.isMapped("vehicleId") ? r.get("vehicleId") : null;
                        Vehicle vehicle;

                        if (vehicleIdStr == null || vehicleIdStr.isBlank()) {
                            // Auto-select user's first vehicle
                            vehicle = vehicleService.getUsersFirstVehicle(user);
                            if (vehicle == null) {
                                throw new IllegalArgumentException("No vehicles found for user. Please create a vehicle first.");
                            }
                        } else {
                            vehicle = resolveVehicleForUser(vehicleIdStr, user);
                        }
                        jd.setVehicle(vehicle);

                        // required journey fields
                        String distance = r.get("distanceKm");
                        String energy = r.get("energyConsumedKwh");
                        if (distance == null || distance.isEmpty()) {
                            throw new IllegalArgumentException("Missing distanceKm");
                        }
                        if (energy == null || energy.isEmpty()) {
                            throw new IllegalArgumentException("Missing energyConsumedKwh");
                        }
                        jd.setDistanceKm(new BigDecimal(distance));
                        jd.setEnergyConsumedKwh(new BigDecimal(energy));

                        // optional fields
                        String co2 = r.isMapped("co2ReducedKg") ? r.get("co2ReducedKg") : null;
                        if (co2 != null && !co2.isEmpty()) {
                            jd.setCo2ReducedKg(new BigDecimal(co2));
                        }
                        if (r.isMapped("startTime")) {
                            String start = r.get("startTime");
                            if (start != null && !start.isBlank()) {
                                jd.setStartTime(LocalDateTime.parse(start.trim(), ISO_DT));
                            }
                        }
                        if (r.isMapped("endTime")) {
                            String end = r.get("endTime");
                            if (end != null && !end.isBlank()) {
                                jd.setEndTime(LocalDateTime.parse(end.trim(), ISO_DT));
                            }
                        }

                        // Check for duplicate journeys before creation
                        if (isDuplicateJourney(jd)) {
                            throw new IllegalArgumentException("Duplicate journey detected - same date and characteristics as existing journey");
                        }

                        // Create journey with auto-validation
                        JourneyData saved = journeyDataService.createJourneyWithAutoValidation(jd);
                        createdIds.add(saved.getId().toString());
                        success++;

                        // If journey is auto-approved (VALID status), accumulate CO2 for wallet
                        if (saved.getVerificationStatus() == JourneyData.VerificationStatus.VALID) {
                            totalValidCo2 = totalValidCo2.add(saved.getCo2ReducedKg());
                        }

                    } catch (Exception ex) {
                        failed++;
                        errors.add("Row " + processed + ": " + ex.getMessage());
                        log.warn("CSV import failed at row {}: {}", processed, ex.getMessage());
                    }
                }

                // Add accumulated valid CO2 to user's wallet
                if (totalValidCo2.compareTo(BigDecimal.ZERO) > 0) {
                    walletService.updateCo2ReducedKg(user.getId(), totalValidCo2);
                    log.info("Added {} kg CO2 to user {}'s wallet from auto-validated journeys",
                            totalValidCo2, user.getUsername());
                }
            }
        } catch (Exception e) {
            errors.add("Parse error: " + e.getMessage());
            log.error("Failed to parse CSV: {}", e.getMessage());
        }

        return new ImportCSVResponse(processed, success, failed, createdIds, errors);
    }

    private Vehicle resolveVehicleForUser(String vehicleIdStr, User user) {
        try {
            UUID id = UUID.fromString(vehicleIdStr.trim());
            return vehicleService.findByIdAndUser(id, user)
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found for vehicleId=" + id));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid vehicleId format: " + vehicleIdStr);
        }
    }

    /**
     * Check if the journey is a duplicate of existing journeys
     */
    private boolean isDuplicateJourney(JourneyData journeyData) {
        // Check for exact duplicates (same user, vehicle, date, distance, energy)
        List<JourneyData> exactDuplicates = journeyDataRepository.findPotentialDuplicates(
                journeyData.getUser(),
                journeyData.getVehicle(),
                journeyData.getStartTime(),
                journeyData.getDistanceKm(),
                journeyData.getEnergyConsumedKwh()
        );

        if (!exactDuplicates.isEmpty()) {
            log.warn("Exact duplicate journey found for user {} on date {}",
                    journeyData.getUser().getUsername(),
                    journeyData.getStartTime().toLocalDate());
            return true;
        }

        // Check for potential duplicates (same user, vehicle, and date with overlapping times)
        List<JourneyData> sameDayJourneys = journeyDataRepository.findJourneysByUserVehicleAndDate(
                journeyData.getUser(),
                journeyData.getVehicle(),
                journeyData.getStartTime()
        );

        if (journeyData.getStartTime() != null && journeyData.getEndTime() != null) {
            for (JourneyData existing : sameDayJourneys) {
                if (existing.getStartTime() != null && existing.getEndTime() != null) {
                    // Check for time overlap
                    boolean startTimeOverlap = !journeyData.getStartTime().isAfter(existing.getEndTime());
                    boolean endTimeOverlap = !journeyData.getEndTime().isBefore(existing.getStartTime());

                    if (startTimeOverlap && endTimeOverlap) {
                        log.warn("Overlapping journey found for user {} on date {}",
                                journeyData.getUser().getUsername(),
                                journeyData.getStartTime().toLocalDate());
                        return true;
                    }
                }
            }
        }

        return false;
    }
}
