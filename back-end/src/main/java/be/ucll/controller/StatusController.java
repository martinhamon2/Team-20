package be.ucll.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/status")
public class StatusController {
    @GetMapping
    public Map<String, String> getStatus() {
        return Map.of("message", "Courses API is running...");
    }
}
