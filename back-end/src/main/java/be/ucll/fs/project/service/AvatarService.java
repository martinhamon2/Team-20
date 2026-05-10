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

@Service
public class AvatarService {
    // Stored relative to the working directory of the Spring Boot process
    public static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    private static final int MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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

        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);

        try (InputStream in = conn.getInputStream()) {
            byte[] data = in.readNBytes(MAX_SIZE_BYTES + 1);
            if (data.length > MAX_SIZE_BYTES) {
                throw new IllegalArgumentException("Image exceeds maximum allowed size of 5 MB");
            }

            String ext = detectImageExtension(data);
            if (ext == null) {
                throw new IllegalArgumentException("URL does not point to a supported image (PNG, JPEG, GIF, WebP)");
            }

            String filename = sanitizeUsername(username) + "." + ext;
            Files.write(uploadPath.resolve(filename), data);
            return filename;
        } finally {
            conn.disconnect();
        }
    }

    public String validateUrl(String url) {
        try {
            URI uri = new URI(url.trim());
            String scheme = uri.getScheme();
            String host = uri.getHost();

            if (host == null || scheme == null) return "reject";
            if (!scheme.equals("http") && !scheme.equals("https")) return "reject";

            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress addr : addresses) {
                if (addr.isLoopbackAddress()
                        || addr.isSiteLocalAddress()
                        || addr.isLinkLocalAddress()
                        || addr.isAnyLocalAddress()
                        || addr.isMulticastAddress()) {
                    return "reject";
                }
            }

            return "allow";
        } catch (Exception e) {
            return "reject";
        }
    }

    private String detectImageExtension(byte[] data) {
        if (data == null || data.length < 4) return null;

        if (data.length >= 8
                && (data[0] & 0xFF) == 0x89
                && data[1] == 'P' && data[2] == 'N' && data[3] == 'G'
                && data[4] == 0x0D && data[5] == 0x0A
                && (data[6] & 0xFF) == 0x1A && data[7] == 0x0A) {
            return "png";
        }

        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8 && (data[2] & 0xFF) == 0xFF) {
            return "jpg";
        }

        if (data[0] == 'G' && data[1] == 'I' && data[2] == 'F'
                && data[3] == '8' && (data[4] == '7' || data[4] == '9') && data[5] == 'a') {
            return "gif";
        }

        if (data.length >= 12
                && data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F'
                && data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P') {
            return "webp";
        }

        return null;
    }

    private String sanitizeUsername(String username) {
        return username.replaceAll("[^a-zA-Z0-9_\\-]", "_");
    }
}
