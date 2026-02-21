package be.ucll.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class Session {
    @NotBlank(message = "Id should not be empty")
    private String id;

    @NotBlank(message = "Description should not be empty")
    private String description;

    @NotBlank(message = "Type should not be empty")
    private String type;

    @NotBlank(message = "Category should not be empty")
    private String category;

    private LocalDate beginDate;

    private LocalDate endDate;

    private LocalTime beginTime;

    private LocalTime endTime;

    private String location;

    private String mapUrl;

    @Min(value = 0, message = "Capacity should be at least 0")
    private int maxCapacity;

    private SessionSetting sessionSetting = new SessionSetting();

    private List<Registration> registrations = new ArrayList<>();

    protected Session() {

    }

    public Session(String id, String type, String description, String category, LocalDate beginDate,
            LocalDate endDate,
            LocalTime beginTime, LocalTime endTime, String location, String mapUrl, int maxCapacity) {
        setId(id);
        setType(type);
        setDescription(description);
        setCategory(category);
        setBeginDate(beginDate);
        setEndDate(endDate);
        setBeginTime(beginTime);
        setEndTime(endTime);
        setLocation(location);
        setMapUrl(mapUrl);
        setMaxCapacity(maxCapacity);
    }

    public void addRegistration(Registration registration) {
        this.registrations.add(registration);
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public LocalTime getBeginTime() {
        return beginTime;
    }

    public void setBeginTime(LocalTime beginTime) {
        this.beginTime = beginTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getMapUrl() {
        return mapUrl;
    }

    public void setMapUrl(String mapUrl) {
        this.mapUrl = mapUrl;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(int maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public List<Registration> getRegistrations() {
        return registrations;
    }

    public void setRegistrations(List<Registration> registrations) {
        this.registrations = registrations;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public SessionSetting getSessionSetting() {
        return sessionSetting;
    }

    public void setSessionSetting(SessionSetting sessionSetting) {
        this.sessionSetting = sessionSetting;
    }

    public boolean overlapsWith(Session other) {
        LocalDateTime thisStart = null;
        LocalDateTime thisEnd = null;
        LocalDateTime otherStart = null;
        LocalDateTime otherEnd = null;

        if (this.beginDate != null) {
            LocalTime startTime = this.beginTime != null ? this.beginTime : LocalTime.MIDNIGHT;
            thisStart = LocalDateTime.of(this.beginDate, startTime);
            LocalTime endTime = this.endTime != null ? this.endTime : startTime.plusHours(1);
            LocalDate endDateVal = this.endDate != null ? this.endDate : this.beginDate;
            thisEnd = LocalDateTime.of(endDateVal, endTime);
        }

        if (other.beginDate != null) {
            LocalTime startTime = other.beginTime != null ? other.beginTime : LocalTime.MIDNIGHT;
            otherStart = LocalDateTime.of(other.beginDate, startTime);
            LocalTime endTime = other.endTime != null ? other.endTime : startTime.plusHours(1);
            LocalDate endDateVal = other.endDate != null ? other.endDate : other.beginDate;
            otherEnd = LocalDateTime.of(endDateVal, endTime);
        }

        if (thisStart == null || thisEnd == null || otherStart == null || otherEnd == null) {
            return false;
        }

        return thisStart.isBefore(otherEnd) && otherStart.isBefore(thisEnd);
    }

}
