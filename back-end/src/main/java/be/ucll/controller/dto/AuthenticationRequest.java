package be.ucll.controller.dto;

public record AuthenticationRequest(
        String username,
        String password) {
}
