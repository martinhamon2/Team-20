package be.ucll.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import be.ucll.exception.EventException;
import be.ucll.exception.SessionException;
import be.ucll.model.Session;
import be.ucll.model.SessionSetting;
import be.ucll.repository.SessionSettingRepository;

@Service
public class SessionService {
    private final XmlPollingService xmlPollingService;
    private final SessionSettingRepository sessionSettingRepository;

    public SessionService(XmlPollingService xmlPollingService, SessionSettingRepository sessionSettingRepository) {
        this.xmlPollingService = xmlPollingService;
        this.sessionSettingRepository = sessionSettingRepository;
    }

    public SessionSetting changeSessionStatus(String sessionId) throws Exception {
        SessionSetting sessionSetting = sessionSettingRepository.findBySessionId(sessionId);

        if (sessionSetting == null) {
            throw new SessionException("Session setting not found");
        }

        sessionSetting.setActive(!sessionSetting.getActive());
        return sessionSettingRepository.save(sessionSetting);
    }

    public Session getById(String sessionId) throws Exception {
        Optional<Session> optionalSession = xmlPollingService.pollAllXmlEvents().stream()
                .flatMap(e -> e.getSessions().stream())
                .filter(s -> s.getId().equals(sessionId))
                .findFirst();

        Session session = optionalSession
                .orElseThrow(() -> new EventException("Session with id " + sessionId + " not found"));

        return session;
    }
}
