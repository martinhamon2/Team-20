package be.ucll.XmlParserTests;

import be.ucll.model.Event;
import be.ucll.service.ParseService;
import be.ucll.service.XmlParserService;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class XmlParserServiceTest {

    @Mock
    ParseService parseService;

    @InjectMocks
    XmlParserService xmlParserService;

    @Test
    void test_parseAllEvents_returnsEvents() throws Exception {
        XmlParserService svc = spy(xmlParserService);

        Event evt = mock(Event.class);
        Path xml1 = Path.of("file1.xml");
        Path txtFile = Path.of("file2.txt");

        try (MockedStatic<Files> files = mockStatic(Files.class)) {
            files.when(() -> Files.exists(any(Path.class))).thenReturn(true);
            files.when(() -> Files.isDirectory(any(Path.class))).thenReturn(true);
            files.when(() -> Files.list(any(Path.class))).thenReturn(Stream.of(xml1, txtFile));

            // Make parseXml return our mocked event only for the XML file
            doAnswer(invocation -> {
                Path path = invocation.getArgument(0);
                return path.toString().endsWith(".xml") ? evt : null;
            }).when(svc).parseXml(any(Path.class));

            List<Event> events = svc.parseAllEvents();

            assertEquals(1, events.size());
            assertSame(evt, events.get(0));
        }
    }

    @Test
    void test_parseAllEvents_returnsEmpty_whenFolderMissing() throws Exception {
        try (MockedStatic<Files> files = mockStatic(Files.class)) {
            files.when(() -> Files.exists(any(Path.class))).thenReturn(false);

            List<Event> events = xmlParserService.parseAllEvents();

            assertTrue(events.isEmpty());
            files.verify(() -> Files.list(any(Path.class)), never());
        }
    }

    @Test
    void test_parseXml_returnsEvent() throws Exception {
        Event expected = new Event("E1", "TYPE", "NL", "Desc", null, null);

        // Mock ParseService to return expected event
        when(parseService.parseXmlContentToEvent(anyString())).thenReturn(expected);

        // Use a temporary InputStream
        Path dummyPath = Path.of("dummy.xml");
        XmlParserService svc = spy(xmlParserService);

        try (MockedStatic<Files> files = mockStatic(Files.class)) {
            InputStream is = new ByteArrayInputStream("<xml></xml>".getBytes());
            files.when(() -> Files.newInputStream(dummyPath)).thenReturn(is);

            Event result = svc.parseXml(dummyPath);

            assertNotNull(result);
            assertSame(expected, result);
        }
    }

    @Test
    void test_parseXml_returnsNull_onException() throws Exception {
        XmlParserService svc = spy(xmlParserService);

        Path dummyPath = Path.of("dummy.xml");

        try (MockedStatic<Files> files = mockStatic(Files.class)) {
            files.when(() -> Files.newInputStream(dummyPath))
                    .thenThrow(new RuntimeException("boom"));

            Event result = svc.parseXml(dummyPath);
            assertNull(result);
        }
    }
}
