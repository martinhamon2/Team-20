package be.ucll.fs.project.unit.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User("testUser", "testPassword","test@email.be", Role.ADMIN);
    }

    @Test
    void givenNewDetails_whenUserIsConstructed_thenAllFieldsAreSetCorrectly() {
        User user = new User("testUser2", "testPassword2","test@email.be", Role.USER);

        assertEquals("testUser2", user.getUsername());
        assertEquals("testPassword2", user.getPassword());
        assertEquals(Role.USER ,user.getRole());
    }

    @Test
    void givenInitialUsername_whenSetUsernameIsCalled_thenUsernameIsUpdated() {
        user.setUsername("testUser2");

        assertEquals("testUser2", user.getUsername());
    }

    @Test
    void givenInitialPassword_whenSetPasswordIsCalled_thenPasswordIsUpdated() {
        user.setPassword("testPassword2");

        assertEquals("testPassword2", user.getPassword());
    }

    @Test
    void givenInitialIsAdminFalse_whenSetAdminIsCalledTrue_thenIsAdminIsUpdated() {
        user.setRole(Role.STAFF);

        assertEquals(Role.STAFF ,user.getRole());
    }
}
