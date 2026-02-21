package be.ucll.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.model.SessionSetting;
import be.ucll.service.SessionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/sessions")
public class SessionController {
    private SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PutMapping("/{sessionId}")
    public SessionSetting changeSessionStatus(@Valid @PathVariable String sessionId) throws Exception {
        return sessionService.changeSessionStatus(sessionId);
    }
}
