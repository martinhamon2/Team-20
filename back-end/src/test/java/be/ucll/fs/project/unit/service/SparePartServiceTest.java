package be.ucll.fs.project.unit.service;

import be.ucll.fs.project.repository.SparePartRepository;
import be.ucll.fs.project.service.SparePartService;
import be.ucll.fs.project.unit.model.SparePart;
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
public class SparePartServiceTest {

    @Mock
    private SparePartRepository sparePartRepository;

    @InjectMocks
    private SparePartService sparePartService;

    @Test
    void getAllSpareParts_shouldReturnList() {
        SparePart part = new SparePart("Wheel", "Rubber");
        when(sparePartRepository.findAll()).thenReturn(List.of(part));

        List<SparePart> result = sparePartService.getAllSpareParts();

        assertEquals(1, result.size());
        verify(sparePartRepository).findAll();
    }

    @Test
    void getSparePartById_shouldReturnSparePart() {
        Long id = 1L;
        SparePart part = new SparePart("Wheel", "Rubber");
        when(sparePartRepository.findSparePartById(id)).thenReturn(part);

        SparePart result = sparePartService.getSparePartById(id);

        assertNotNull(result);
        assertEquals("Wheel", result.getName());
        verify(sparePartRepository).findSparePartById(id);
    }
}