package be.ucll.controller.dto;

import be.ucll.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserPongDTO(
        @NotBlank(message = "Id is required") Long id,
        @NotBlank(message = "Username is required") String username,
        @Email(message = "Invalid email format") String email, @NotNull Role role) {
}
