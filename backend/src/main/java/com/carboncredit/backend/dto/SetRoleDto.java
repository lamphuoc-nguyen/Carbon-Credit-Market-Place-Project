package com.carboncredit.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetRoleDto {
    @NotNull(message = "Role ID is required")
    private Integer roleId;

    @NotBlank(message = "Role name is required")
    private String roleName;
}
