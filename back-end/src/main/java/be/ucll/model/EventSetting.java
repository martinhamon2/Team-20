package be.ucll.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "event_settings")
public class EventSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "EventId should not be empty")
    private String eventId;

    @NotNull(message = "Sorting order may not be empty")
    private SortOrder sortOrder = SortOrder.ASC;

    @NotNull(message = "Sorting field may not be empty")
    private SortField sortField = SortField.TYPE;

    @NotNull(message = "Move full to back value may not be empty")
    private boolean moveFullToBack = true;

    @NotNull(message = "Move past to back value may not be empty")
    private boolean movePastToBack = true;

    @NotNull(message = "Validate overlapping value may not be empty")
    private boolean validateOverlapping = true;

    @NotNull(message = "Can unsubscribe value may not be empty")
    private boolean canUnsubscribe = true;

    @NotNull(message = "Phone format may not be empty")
    private PhoneFormat phoneFormat = PhoneFormat.INTERNATIONAL;

    @NotNull(message = "Template name may not be empty")
    private String templateName = "registration-confirmation";

    private String primaryColor = "#007bb1";

    private String secondaryColor = "#00b0e0";

    private Boolean active = false;

    protected EventSetting() {
    }

    public EventSetting(String eventId) {
        setEventId(eventId);
    }

    public EventSetting(String eventId, SortOrder sortOrder, SortField sortField, boolean moveFullBack,
            boolean movePastToBack,
            boolean validateOverlapping, boolean canUnsubscribe, PhoneFormat phoneFormat) {
        setEventId(eventId);
        setSortOrder(sortOrder);
        setSortField(sortField);
        setMoveFullToBack(moveFullBack);
        setMovePastToBack(movePastToBack);
        setValidateOverlapping(validateOverlapping);
        setCanUnsubscribe(canUnsubscribe);
        setPhoneFormat(phoneFormat);
    }

    public SortOrder getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(SortOrder sortOrder) {
        this.sortOrder = sortOrder;
    }

    public SortField getSortField() {
        return sortField;
    }

    public void setSortField(SortField sortField) {
        this.sortField = sortField;
    }

    public boolean isMoveFullToBack() {
        return moveFullToBack;
    }

    public void setMoveFullToBack(boolean moveFullToBack) {
        this.moveFullToBack = moveFullToBack;
    }

    public boolean isMovePastToBack() {
        return movePastToBack;
    }

    public void setMovePastToBack(boolean movePastToBack) {
        this.movePastToBack = movePastToBack;
    }

    public boolean isValidateOverlapping() {
        return validateOverlapping;
    }

    public void setValidateOverlapping(boolean validateOverlapping) {
        this.validateOverlapping = validateOverlapping;
    }

    public PhoneFormat getPhoneFormat() {
        return phoneFormat;
    }

    public void setPhoneFormat(PhoneFormat phoneFormat) {
        this.phoneFormat = phoneFormat;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public boolean isCanUnsubscribe() {
        return canUnsubscribe;
    }

    public void setCanUnsubscribe(boolean canUnsubscribe) {
        this.canUnsubscribe = canUnsubscribe;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
    }
}
