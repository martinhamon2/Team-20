package be.ucll.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserInput(
        @NotBlank(message = "Username is required") String username,
        @Email(message = "Invalid email format") String email,
        @NotBlank(message = "Password is required") String password) {
}
