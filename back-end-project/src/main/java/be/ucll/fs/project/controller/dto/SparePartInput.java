package be.ucll.fs.project.controller.dto;

import be.ucll.fs.project.unit.model.Attraction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SparePartInput(
        @NotNull(message = "Id is required")
        Long id,

        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Type is required")
        String type,

        List<Attraction> attractions
) {

}
