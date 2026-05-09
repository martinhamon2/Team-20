package be.ucll.fs.project.controller.dto;
import jakarta.validation.constraints.NotBlank;

public record UserInput(
        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Password is required")
        String password,

        @NotBlank(message = "Email is required")
        String email,
        
        String avatarUrl
) {}