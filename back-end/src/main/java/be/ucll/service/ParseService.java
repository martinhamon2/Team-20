package be.ucll.service;

import org.hibernate.service.spi.ServiceException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import be.ucll.model.Event;
import be.ucll.model.Session;
import be.ucll.model.SessionSetting;
import be.ucll.repository.XmlParser;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class ParseService {
    private final ObjectMapper objectMapper;

    public ParseService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    private void addSessionToEvent(Event event, JsonNode sessionNode) {
        String sessionId = getTextValue(sessionNode, "SESSIE_ID");
        String sessionDescription = getTextValue(sessionNode, "SESSIE_OMSCH");
        String sessionType = getTextValue(sessionNode, "SESSIE_TYPE");
        String category = getTextValue(sessionNode, "CATEGORIE");
        LocalDate beginDate = parseDate(getTextValue(sessionNode, "DATUM_VAN"));
        LocalDate endDate = parseDate(getTextValue(sessionNode, "DATUM_TOT"));
        LocalTime beginTime = parseTime(getTextValue(sessionNode, "TIJD_VAN"));
        LocalTime endTime = parseTime(getTextValue(sessionNode, "TIJD_TOT"));
        String location = getTextValue(sessionNode, "LOKAAL");
        String mapUrl = getTextValue(sessionNode, "MAP_URL");
        int maxCapacity = parseMaxCapacity(getTextValue(sessionNode, "MAX_AANTAL"));
        boolean publish = "J".equals(getTextValue(sessionNode, "PUBLICEREN"));

        Session session = new Session(sessionId,
                sessionDescription, sessionType, category,
                beginDate, endDate, beginTime, endTime,
                location, mapUrl, maxCapacity);

        SessionSetting sessionSetting = new SessionSetting(sessionId);
        sessionSetting.setActive(publish);
        session.setSessionSetting(sessionSetting);

        event.addSession(session);
    }

    private String getTextValue(JsonNode node, String key) {
        JsonNode child = node.get(key);
        if (child != null && !child.isNull()) {
            return child.asText().trim();
        }
        return null;
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(dateStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.isEmpty()) {
            return LocalTime.of(0, 0);
        }
        try {
            return LocalTime.parse(timeStr.trim(), DateTimeFormatter.ISO_LOCAL_TIME);
        } catch (Exception e) {
            return LocalTime.of(0, 0);
        }
    }

    private int parseMaxCapacity(String capacityStr) {
        if (capacityStr == null || capacityStr.isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(capacityStr.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    public Event parseXmlContentToEvent(String xmlContent) throws Exception {
        Object parsedData = XmlParser.parseXmlToJsonFromString(xmlContent);

        String jsonString = objectMapper.writeValueAsString(parsedData);
        JsonNode rootNode = objectMapper.readTree(jsonString);
        JsonNode itemNode = rootNode.path("item");

        String eventId = getTextValue(itemNode, "EVENT_ID");
        String eventType = getTextValue(itemNode, "EVENT_TYPE");
        String eventLanguage = getTextValue(itemNode, "EVENT_TAAL");
        String eventDescription = getTextValue(itemNode, "EVENT_OMSCH");
        LocalDate eventBeginDate = parseDate(getTextValue(itemNode, "DATUM_PUBL_VAN"));
        LocalDate eventEndDate = parseDate(getTextValue(itemNode, "DATUM_PUBL_TOT"));

        Event event = new Event(eventId, eventType, eventLanguage, eventDescription, eventBeginDate, eventEndDate);
        event.getEventSetting().setActive(true);

        JsonNode sessiesNode = itemNode.path("SESSIES");
        if (sessiesNode.has("item")) {
            JsonNode sessionItems = sessiesNode.path("item");

            if (sessionItems.isArray()) {
                for (JsonNode sessionNode : sessionItems) {
                    addSessionToEvent(event, sessionNode);
                }
            } else {
                addSessionToEvent(event, sessionItems);
            }
        }

        return event;
    }

    public Event uploadXml(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new ServiceException("File is empty");
        }

        Path rootDir = Path.of(System.getProperty("user.dir"));
        Path folderPath = rootDir.resolve("xml");

        if (!Files.exists(folderPath)) {
            Files.createDirectories(folderPath);
        }

        Path targetPath = folderPath.resolve(file.getOriginalFilename());

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }

        String xmlContent;
        try (InputStream is = Files.newInputStream(targetPath)) {
            xmlContent = new String(is.readAllBytes());
        }

        return parseXmlContentToEvent(xmlContent);
    }

}