package be.ucll.fs.project.unit.service;

import be.ucll.fs.project.controller.dto.AttractionInput;
import be.ucll.fs.project.repository.AttractionRepository;
import be.ucll.fs.project.repository.ParkRepository;
import be.ucll.fs.project.repository.SparePartRepository;
import be.ucll.fs.project.service.AttractionService;
import be.ucll.fs.project.unit.model.Attraction;
import be.ucll.fs.project.unit.model.Park;
import be.ucll.fs.project.unit.model.Status;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AttractionServiceTest {

    @Mock
    private AttractionRepository attractionRepository;

    @Mock
    private ParkRepository parkRepository;

    @Mock
    private SparePartRepository sparePartRepository;

    @InjectMocks
    private AttractionService attractionService;

    private Attraction attraction;
    private Park park;

    @BeforeEach
    void setUp() {
        park = new Park("Test Park");
        attraction = new Attraction("Rollercoaster", "Speedy", LocalTime.of(0, 30), true, 10, 140);
        attraction.setPark(park);
        attraction.setStatus(Status.UP);
    }

    @Test
    void getAttractions_shouldReturnList() {
        when(attractionRepository.findAll()).thenReturn(List.of(attraction));

        List<Attraction> result = attractionService.getAttractions();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Speedy", result.get(0).getName());
        verify(attractionRepository, times(1)).findAll();
    }

    @Test
    void createAttraction_shouldSaveAndReturnAttraction() {
        AttractionInput input = new AttractionInput(
                "Speedy", "Rollercoaster", LocalTime.of(0, 30),
                true, 10, 140, 1L, Collections.emptyList()
        );

        when(parkRepository.findById(1L)).thenReturn(Optional.of(park));
        when(attractionRepository.save(any(Attraction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Attraction created = attractionService.createAttraction(input);

        assertNotNull(created);
        assertEquals("Speedy", created.getName());
        assertEquals(Status.UP, created.getStatus()); // Verify business rule set in service
        verify(parkRepository, times(1)).findById(1L);
        verify(attractionRepository, times(1)).save(any(Attraction.class));
    }

    @Test
    void changeAttractionStatus_shouldRotateStatus() {
        Long id = 1L;
        attraction.setStatus(Status.UP);
        when(attractionRepository.findAttractionById(id)).thenReturn(attraction);
        when(attractionRepository.save(any(Attraction.class))).thenReturn(attraction);

        Attraction updated = attractionService.changeAttractionStatus(id);

        assertEquals(Status.DOWN, updated.getStatus());
        verify(attractionRepository, times(1)).save(attraction);
    }

    @Test
    void updateAttractionDetails_shouldUpdateFields() {
        Long id = 1L;
        AttractionInput input = new AttractionInput(
                "UpdatedName", "WaterRide", LocalTime.of(1, 0),
                false, 5, 100, 1L, null
        );

        AttractionInput partialInput = new AttractionInput(
                null, "WaterRide", null,
                false, 0, 0, null, null
        );

        when(attractionRepository.findAttractionById(id)).thenReturn(attraction);
        when(attractionRepository.save(any(Attraction.class))).thenReturn(attraction);

        Attraction result = attractionService.updateAttractionDetails(id, partialInput);

        assertEquals("WaterRide", result.getType());
        verify(attractionRepository, times(1)).save(attraction);
    }
}