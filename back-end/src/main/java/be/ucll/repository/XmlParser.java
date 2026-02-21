package be.ucll.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import java.io.IOException;
import java.io.InputStream;

public class XmlParser {

    public static Object parseXmlToJsonFromString(String xmlContent) throws Exception {
        XmlMapper xmlMapper = new XmlMapper();
        JsonNode node = xmlMapper.readTree(xmlContent.getBytes());
        return node;
    }

    public static String parseXmlToJson(String xmlFilePath) throws IOException {
        String resourcePath = xmlFilePath.startsWith("xml/")
                ? xmlFilePath
                : "xml/" + xmlFilePath;

        try (InputStream is = XmlParser.class.getClassLoader().getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new IOException("XML file not found on classpath: " + resourcePath);
            }

            XmlMapper xmlMapper = new XmlMapper();
            JsonNode node = xmlMapper.readTree(is);

            ObjectMapper jsonMapper = new ObjectMapper();
            return jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
        }
    }
}
