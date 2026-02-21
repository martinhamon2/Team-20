package be.ucll.service;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import be.ucll.model.Event;

@Service
public class XmlParserService {
    private final ParseService parseService;

    public XmlParserService(ParseService parseService) {
        this.parseService = parseService;
    }

    public List<Event> parseAllEvents() throws Exception {
        Path xmlFolder = Path.of(System.getProperty("user.dir"), "xml");
        if (!Files.exists(xmlFolder) || !Files.isDirectory(xmlFolder)) {
            return List.of();
        }

        return Files.list(xmlFolder)
                .filter(path -> path.toString().endsWith(".xml"))
                .map(this::parseXml)
                .filter(Objects::nonNull)
                .toList();
    }

    public Event parseXml(Path path) {
        try (InputStream is = Files.newInputStream(path)) {
            String xmlContent = new String(is.readAllBytes());
            return parseService.parseXmlContentToEvent(xmlContent);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
