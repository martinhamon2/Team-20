package be.ucll.fs.project.controller.dto;

import jakarta.validation.constraints.*;

import java.time.LocalTime;
import java.util.List;

public record AttractionInput(
    @NotBlank(message = "Name is required")
    String name,

    @NotBlank(message = "Type is required")
    String type,

    LocalTime waitTime,

    @NotNull(message = "Accessibility information is required")
    boolean accessibility,

    @NotNull(message = "Minimum age is required")
    @Min(value = 0, message = "Minimum age cannot be negative")
    @Max(value = 18, message = "Minimum age cannot exceed 18")
    Integer minAge,

    @NotNull(message = "Minimum height is required")
    @Min(value = 0, message = "Minimum height cannot be negative")
    @Max(value = 165, message = "Minimum height cannot exceed 165 cm")
    Integer minHeight,

    @NotNull(message = "Park ID is required")
    @Min(message = "Park ID must be positive", value = 1)
    Long parkId,

    @NotEmpty(message = "At least one spare part is required")
    List<Long> sparePartIds
) {}
