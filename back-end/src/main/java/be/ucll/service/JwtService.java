package be.ucll.service;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import be.ucll.config.JwtProperties;
import be.ucll.model.Role;
import be.ucll.model.User;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.function.Consumer;

@Service
public class JwtService {
    private final JwtProperties jwtProperties;
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    public JwtService(JwtProperties jwtProperties,
            JwtEncoder jwtEncoder, JwtDecoder jwtDecoder) {
        this.jwtProperties = jwtProperties;
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
    }

    public Jwt decodeToken(String token) {
        return jwtDecoder.decode(token);
    }

    public String generateToken(String username, Role role) {
        return buildAndEncodeJwt(
                claims -> claims
                        .subject(username)
                        .claim("scope", role.toGrantedAuthority().getAuthority()));
    }

    public String generateToken(User user) {
        return generateToken(user.getUsername(), user.getRole());
    }

    public String generateRegistrationToken(String email, Long registrationId) {
        return buildAndEncodeJwt(
                claims -> claims
                        .subject(email)
                        .claim("registrationId", registrationId)
                        .claim("type", "registration"));
    }

    private String buildAndEncodeJwt(Consumer<JwtClaimsSet.Builder> customizer) {
        final var now = Instant.now();
        final var expiresAt = now.plus(jwtProperties.token().lifetime());
        final var header = JwsHeader.with(MacAlgorithm.HS256).build();
        final var builder = JwtClaimsSet.builder()
                .issuer(jwtProperties.token().issuer())
                .issuedAt(now)
                .expiresAt(expiresAt);
        customizer.accept(builder);
        final var claims = builder.build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public String generateEmailToken(String email) {
        return buildAndEncodeJwt(
                claims -> claims
                        .subject(email));
    }
}