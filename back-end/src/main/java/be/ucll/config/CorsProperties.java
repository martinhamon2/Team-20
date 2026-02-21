package be.ucll.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.net.URL;
import java.util.List;

@ConfigurationProperties(prefix = "cors")
public record CorsProperties(List<URL> allowedOrigins) {
}
