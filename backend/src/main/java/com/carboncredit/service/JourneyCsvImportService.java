package com.carboncredit.service;

import com.carboncredit.dto.ImportCSVResponse;
import com.carboncredit.entity.JourneyData;
import com.carboncredit.entity.User;
import com.carboncredit.entity.Vehicle;
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

    private static final DateTimeFormatter ISO_DT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public ImportCSVResponse importCsv(MultipartFile file, User user) {
        int processed = 0, success = 0, failed = 0;
        List<String> createdIds = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = CSVFormat.DEFAULT
                     .withFirstRecordAsHeader()
                     .withIgnoreEmptyLines(true)
                     .withTrim()
                     .parse(reader)) {

            for (CSVRecord r : parser) {
                processed++;
                try {
                    JourneyData jd = new JourneyData();
                    jd.setUser(user);

                    // vehicleId is required for each row
                    String vehicleIdStr = r.isMapped("vehicleId") ? r.get("vehicleId") : null;
                    if (vehicleIdStr == null || vehicleIdStr.isBlank()) {
                        throw new IllegalArgumentException("Missing vehicleId");
                    }
                    Vehicle vehicle = resolveVehicleForUser(vehicleIdStr, user);
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

                    // create journey -> stays PENDING_VERIFICATION for CVA
                    JourneyData saved = journeyDataService.createJourney(jd);
                    createdIds.add(saved.getId().toString());
                    success++;

                } catch (Exception ex) {
                    failed++;
                    errors.add("Row " + processed + ": " + ex.getMessage());
                    log.warn("CSV import failed at row {}: {}", processed, ex.getMessage());
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
}
