package be.ucll.fs.project.unit.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AttractionTest {

    private Attraction attraction;
    private Park park;
    private List<SparePart> initialParts;
    private List<SparePart> newParts;

    @BeforeEach
    void setUp() {
        String type = "test";
        String name = "test";
        LocalTime waitTime = LocalTime.of(1, 0);
        boolean accessibility = true;
        int minAge = 10;
        int minHeight = 140;
        
        attraction = new Attraction(type, name, waitTime, accessibility, minAge, minHeight);
        park = new Park();

        initialParts = new ArrayList<>();
        initialParts.add(new SparePart());

        newParts = new ArrayList<>();
        newParts.add(new SparePart());
    }

    @Test
    void givenValidAttractionData_whenAttractionCreated_thenFieldsAreCorrectlySet() {
        assertEquals("test", attraction.getName());
        assertEquals("test", attraction.getType());
        assertEquals(LocalTime.of(1, 0), attraction.getWaitTime());
        assertTrue(attraction.isAccessibility());
        assertEquals(10, attraction.getMinAge());
        assertEquals(140, attraction.getMinHeight());
    }

    @Test
    void givenAttractionAndPark_whenSetPark_thenParkIsRetrievable() {
        attraction.setPark(park);

        assertEquals(park, attraction.getPark());
    }

    @Test
    void givenAttractionWithExistingParts_whenSetSparePartsCalledAgain_thenNewPartsAreAppended() {
        attraction.setSpareParts(initialParts);
        int sizeAfterFirstSet = attraction.getSpareParts().size();

        attraction.setSpareParts(newParts);
        int sizeAfterSecondSet = attraction.getSpareParts().size();

        assertEquals(1, sizeAfterFirstSet);
        assertEquals(2, sizeAfterSecondSet);
    }

    // unhappy paths

    @Test
    void givenAttraction_whenSetSparePartsWithNull_thenNullPointerExceptionIsThrown() {
        assertThrows(NullPointerException.class, () -> {
            attraction.setSpareParts(null);
        });
    }
}