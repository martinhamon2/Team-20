package be.ucll.fs.project.integration;

import be.ucll.fs.project.Application;
import be.ucll.fs.project.controller.dto.AttractionInput;
import be.ucll.fs.project.controller.dto.AuthenticationRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(classes = Application.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testFullAttractionLifecycleWithSecurity() throws Exception {
        AuthenticationRequest loginRequest = new AuthenticationRequest("admin", "admin123");

        MvcResult loginResult = mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie authCookie = loginResult.getResponse().getCookie("authToken");
        if (authCookie == null) {
            throw new RuntimeException("Login failed, no cookie received");
        }

        AttractionInput input = new AttractionInput(
                "IntegrationCoaster",
                "Coaster",
                LocalTime.of(0, 5),
                true,
                12,
                140,
                1L,
                List.of(1L)
        );

        mockMvc.perform(post("/attractions")
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("IntegrationCoaster"))
                .andExpect(jsonPath("$.status").value("UP"));

        mockMvc.perform(get("/attractions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'IntegrationCoaster')]").exists());
    }

    @Test
    public void accessProtectedEndpointWithoutToken_shouldFail() throws Exception {
        AttractionInput input = new AttractionInput(
                "HackerCoaster", "Coaster", LocalTime.of(0, 5),
                true, 12, 140, 1L, List.of(1L)
        );

        mockMvc.perform(post("/attractions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                // Error 401
                .andExpect(status().isUnauthorized());
    }
}