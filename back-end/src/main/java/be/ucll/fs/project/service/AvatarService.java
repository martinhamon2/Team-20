package be.ucll.fs.project.service;

import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class AvatarService {
    // Stored relative to the working directory of the Spring Boot process
    public static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    public String downloadAndStore(String username, String avatarUrl) throws Exception {
        String validation = validateUrl(avatarUrl);
        if (!"allow".equals(validation)) {
            throw new IllegalArgumentException("URL rejected by SSRF protection");
        }

        URI uri = new URI(avatarUrl.trim());
        URL url = uri.toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        conn.setInstanceFollowRedirects(false);

        String contentType = conn.getContentType();
        String ext = resolveExtension(contentType, avatarUrl);

        String filename = sanitizeUsername(username) + "." + ext;
        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);

        try (InputStream in = conn.getInputStream()) {
            Files.copy(in, uploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } finally {
            conn.disconnect();
        }

        return filename;
    }

    public String validateUrl(String url) {
        try {
            URI uri = new URI(url.trim());
            String scheme = uri.getScheme();
            String host = uri.getHost();

            if (host == null || scheme == null) return "reject";
            if (!scheme.equals("http") && !scheme.equals("https")) return "reject";
            InetAddress address = InetAddress.getByName(host);
            if (address.isLoopbackAddress() || address.isSiteLocalAddress()) return "reject";

            return "allow";
        } catch (Exception e) {
            return "reject";
        }
    }

    private String resolveExtension(String contentType, String url) {
        if (contentType != null) {
            if (contentType.contains("png"))  return "png";
            if (contentType.contains("gif"))  return "gif";
            if (contentType.contains("webp")) return "webp";
            if (contentType.contains("jpeg") || contentType.contains("jpg")) return "jpg";
        }
        String lower = url.toLowerCase();
        if (lower.contains(".png"))  return "png";
        if (lower.contains(".gif"))  return "gif";
        if (lower.contains(".webp")) return "webp";
        return "jpg";
    }

    private String sanitizeUsername(String username) {
        return username.replaceAll("[^a-zA-Z0-9_\\-]", "_");
    }
}
