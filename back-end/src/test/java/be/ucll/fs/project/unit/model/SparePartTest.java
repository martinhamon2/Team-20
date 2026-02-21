package be.ucll.fs.project.unit.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SparePartTest {

    private SparePart sparePart;

    @BeforeEach
    void setUp() {
        sparePart = new SparePart("testName", "testType");
    }

    @Test
    void givenNewDetails_whenSparePartIsConstructed_thenFieldsAreSetCorrectly() {
        SparePart part = new SparePart("testName2", "testType2");

        assertEquals("testName2", part.getName());
        assertEquals("testType2", part.getType());
        // id is only set in the database
        assertNull(part.getId());
        assertNull(part.getAttractionList());
    }

    @Test
    void givenInitialName_whenSetNameIsCalled_thenNameIsUpdated() {
        sparePart.setName("testName2");

        assertEquals("testName2", sparePart.getName());
    }

    @Test
    void givenInitialType_whenSetTypeIsCalled_thenTypeIsUpdated() {
        sparePart.setType("testType2");

        assertEquals("testType2", sparePart.getType());
    }

    @Test
    void givenInitializedAttractionList_whenAddingSecondList_thenListSizeIncrementsCorrectly() {
        List<Attraction> attractions1 = Arrays.asList(
                new Attraction("roller coaster", "Small Coaster", null, false, 8, 110),
                new Attraction("roller coaster", "Big Coaster", null, true, 14, 140)
        );
        sparePart.addAttractionList(attractions1);
        int initialSize = sparePart.getAttractionList().size();
        assertEquals(2, sparePart.getAttractionList().size());

        List<Attraction> attractions2 = Arrays.asList(
                new Attraction("water ride", "Water Ride", LocalTime.of(1, 20), false, 8, 100)
        );
        sparePart.addAttractionList(attractions2);

        assertEquals(initialSize + 1, sparePart.getAttractionList().size());
    }

    @Test
    void givenSparePartWithExistingAttractionList_whenAddAttractionListIsCalledWithEmptyList_thenListSizeRemainsTheSame() {
        List<Attraction> initialAttractions = Arrays.asList(
                new Attraction("dark ride", "Single Ride", LocalTime.of(5, 0), false, 0, 0)
        );
        sparePart.addAttractionList(initialAttractions);
        int size = sparePart.getAttractionList().size();

        sparePart.addAttractionList(Collections.emptyList());

        assertEquals(size, sparePart.getAttractionList().size());
    }

    // unhappy paths

    @Test
    void givenSparePart_whenAddAttractionListIsCalledWithNullList_thenNullPointerExceptionIsThrown() {
        List<Attraction> nullAttractions = null;

        assertThrows(NullPointerException.class, () -> {
            SparePart part = new SparePart("testName", "testType");
            part.addAttractionList(nullAttractions);
        });

        sparePart.addAttractionList(Collections.emptyList());
        assertThrows(NullPointerException.class, () -> {
            sparePart.addAttractionList(nullAttractions);
        });
    }
}
