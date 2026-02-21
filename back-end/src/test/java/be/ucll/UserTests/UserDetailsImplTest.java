package be.ucll.UserTests;

import be.ucll.model.User;
import be.ucll.service.UserDetailsImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserDetailsImplTest {

    @InjectMocks
    UserDetailsImpl userDetails;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private User user;

    @Test
    void getUsername_returnsUserUsername() {
        when(user.getUsername()).thenReturn("alice");
        assertEquals("alice", userDetails.getUsername());
    }

    @Test
    void getPassword_returnsUserPassword() {
        when(user.getPassword()).thenReturn("secret");
        assertEquals("secret", userDetails.getPassword());
    }
}
