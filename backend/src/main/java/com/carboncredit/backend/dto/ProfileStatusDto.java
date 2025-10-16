package com.carboncredit.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileStatusDto {
    private Integer profileStatus; // 0 = incomplete, 1 = complete
    private boolean hasRole;
    private String roleName;
    private String message;
}
