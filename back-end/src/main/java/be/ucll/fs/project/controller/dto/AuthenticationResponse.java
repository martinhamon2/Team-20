package be.ucll.fs.project.controller.dto;

import be.ucll.fs.project.unit.model.Role;

public record AuthenticationResponse(
        String message,
        String token,
        String username,
        Role role
) {
}
