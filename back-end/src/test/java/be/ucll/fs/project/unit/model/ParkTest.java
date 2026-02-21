package be.ucll.fs.project.unit.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ParkTest {

    private Park park;

    @BeforeEach
    void setUp() {
        park = new Park("Testland");
    }

    @Test
    void givenNewParkName_whenParkIsConstructed_thenNameAndIdAreSetCorrectly() {
        Park park = new Park("Testland");

        assertEquals("Testland", park.getName());
        // id only generated in the db
        assertNull(park.getId());
    }

    @Test
    void givenInitialName_whenSetNameIsCalled_thenNameIsUpdated() {
        park.setName("Namechangeland");

        assertEquals("Namechangeland", park.getName());
    }

    @Test
    void givenParkWithNullAttractions_whenSetAttractionsIsCalledForTheFirstTime_thenListIsInitializedAndSet() {
        List<Attraction> newAttractions = Arrays.asList(
                new Attraction("roller coaster", "Klondike", null, false, 12, 130),
                new Attraction("roller coaster", "The Goliath", null, false, 14, 150)
        );
        park.setAttractions(newAttractions);

        assertNotNull(park.getAttractions());
        assertEquals(2, park.getAttractions().size());
    }

    @Test
    void givenParkWithExistingAttractions_whenSetAttractionsIsCalledAgain_thenNewAttractionsAreAppended() {
        List<Attraction> attractions1 = Arrays.asList(new Attraction("roller coaster", "Klondike", null, false, 12, 130));
        park.setAttractions(attractions1);
        int size = park.getAttractions().size();

        List<Attraction> attractions2 = Arrays.asList(new Attraction("roller coaster", "The Goliath", null, false, 14, 150), new Attraction("water ride", "Vortex", LocalTime.of(1, 20), true, 8, 100));
        park.setAttractions(attractions2);

        assertEquals(size + 2, park.getAttractions().size());
    }

    @Test
    void givenParkWithExistingAttractions_whenSetAttractionsIsCalledWithEmptyList_thenListSizeRemainsTheSame() {
        List<Attraction> attractions = Arrays.asList(new Attraction("roller coaster", "Klondike", null, false, 12, 130));
        park.setAttractions(attractions);
        int size = park.getAttractions().size();

        park.setAttractions(Collections.emptyList());

        assertEquals(size, park.getAttractions().size());
    }

    // unhappy paths

    @Test
    void givenPark_whenSetAttractionsIsCalledWithNullList_thenNullPointerExceptionIsThrown() {
        List<Attraction> attractions = null;

        assertThrows(NullPointerException.class, () -> {
            Park park = new Park("Testland");
            park.setAttractions(attractions);
        });

        park.setAttractions(Collections.emptyList());
        assertThrows(NullPointerException.class, () -> {
            park.setAttractions(attractions);
        });
    }
}
