package be.ucll.controller.dto;

import be.ucll.model.Role;

public record AuthenticationResponse(
                String message,
                String token,
                String username,
                String email,
                Role role) {
}
