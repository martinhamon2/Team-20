package be.ucll.fs.project.unit.service;

import be.ucll.fs.project.repository.ParkRepository;
import be.ucll.fs.project.service.ParkService;
import be.ucll.fs.project.unit.model.Park;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ParkServiceTest {

    @Mock
    private ParkRepository parkRepository;

    @InjectMocks
    private ParkService parkService;

    @Test
    void getAllParks_shouldReturnListOfParks() {
        Park park = new Park("Walibi");
        when(parkRepository.findAll()).thenReturn(List.of(park));

        List<Park> result = parkService.getAllParks();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Walibi", result.get(0).getName());
        verify(parkRepository).findAll();
    }
}