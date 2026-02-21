package be.ucll.fs.project.controller.dto;

public record AuthenticationRequest(
        String username,
        String password
) {
}
