package be.ucll.fs.project.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults()) // Keep CORS default if needed
                .authorizeHttpRequests(authorize -> authorize
                        // Allow public GET access to Attractions and SpareParts
                        .requestMatchers(HttpMethod.GET, "/attractions/**", "/spareParts/**").permitAll()

                        // Allow all access to health check
                        .requestMatchers("/status").permitAll()
                        // Allow all access to error endpoints
                        .requestMatchers("/error/**").permitAll()
                        // Allow all to login and signup
                        .requestMatchers("/users/login", "/users/signup", "/users/logout").permitAll()
                        // Allow public avatar serving and the vulnerable SQL injection endpoint
                        .requestMatchers(HttpMethod.GET, "/users/*/avatar", "/vuln/get/user").permitAll()
                        // Avatar upload is public so the red team can demo SSRF without needing auth
                        .requestMatchers(HttpMethod.POST, "/users/*/avatar").permitAll()
                        // Allow OpenAPI access
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        // Allow Swagger UI
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Allow Test Utils (if you have them)
                        .requestMatchers("/test-utils/**").permitAll()
                        // Allow SSRF validation endpoint and other vuln endpoints
                        .requestMatchers("/vuln/**").permitAll()
                        // Lock down everything else
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(resourceServer ->
                        resourceServer.jwt(Customizer.withDefaults())
                                .bearerTokenResolver(new CookieBearerTokenResolver()))
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public JwtEncoder jwtEncoder(SecretKey secretKey) {
        final JWK jwk = new OctetSequenceKey.Builder(secretKey)
                .algorithm(JWSAlgorithm.HS256)
                .build();
        final var jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
        return new NimbusJwtEncoder(jwks);
    }

    @Bean
    public SecretKey secretKey(JwtProperties jwtProperties) throws NoSuchAlgorithmException {
        final var secretKeyProperty = jwtProperties.secretKey();

        if (secretKeyProperty == null || secretKeyProperty.isEmpty()) {
            log.warn("No secret key configured, generating a random key.");
            final var secretKeyGenerator = KeyGenerator.getInstance("AES");
            return secretKeyGenerator.generateKey();
        } else {
            final var bytes = Base64.getDecoder().decode(secretKeyProperty);
            return new SecretKeySpec(bytes, "AES");
        }
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKey secretKey) {
        return NimbusJwtDecoder.withSecretKey(secretKey).macAlgorithm(MacAlgorithm.HS256).build();
    }
}