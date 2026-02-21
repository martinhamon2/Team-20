package be.ucll.model;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class Event {
    @NotBlank(message = "Id should not be empty")
    private String id;

    @NotBlank(message = "Type should not be empty")
    private String type;

    @NotBlank(message = "Language should not be empty")
    private String language;

    @NotBlank(message = "Description should not be empty")
    private String description;

    @NotNull(message = "Begin date should not be empty")
    private LocalDate beginDate;

    @NotNull(message = "End date should not be empty")
    private LocalDate endDate;

    @AssertTrue(message = "End date should not be before begin date")
    public boolean isEndDateValid() {
        if (beginDate == null || endDate == null) {
            return true;
        }
        return !endDate.isBefore(beginDate);
    }

    private EventSetting eventSetting = new EventSetting();

    List<Session> sessions = new ArrayList<>();

    protected Event() {

    }

    public Event(String id, String type, String language, String description, LocalDate beginDate,
            LocalDate endDate) {
        setId(id);
        setType(type);
        setLanguage(language);
        setDescription(description);
        setBeginDate(beginDate);
        setEndDate(endDate);
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getBeginDate() {
        return beginDate;
    }

    public void setBeginDate(LocalDate beginDate) {
        this.beginDate = beginDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<Session> getSessions() {
        return sessions;
    }

    public void setSessions(List<Session> sessions) {
        this.sessions = sessions;
    }

    public void addSession(Session session) {
        this.sessions.add(session);
    }

    public EventSetting getEventSetting() {
        return eventSetting;
    }

    public void setEventSetting(EventSetting eventSetting) {
        this.eventSetting = eventSetting;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

}
