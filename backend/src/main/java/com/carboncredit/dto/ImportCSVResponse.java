package com.carboncredit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
public class ImportCSVResponse {

    private int processed;
    private int success;
    private int failed;
    private List<String> createdJourneyIds;
    private List<String> errors;

    public static ImportCSVResponse empty() {
        return new ImportCSVResponse(0,0,0,new ArrayList<>(),new ArrayList<>());
    }

}
