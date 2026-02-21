package be.ucll.controller.dto;

import be.ucll.model.PhoneFormat;
import be.ucll.model.SortField;
import be.ucll.model.SortOrder;

public record EventSettingDTO(
        SortOrder sortOrder,
        SortField sortField,
        boolean moveFullToBack,
        boolean movePastToBack,
        boolean validateOverlapping,
        boolean canUnsubscribe,
        PhoneFormat phoneFormat,
        String templateName,
        String primaryColor,
        String secondaryColor) {
}
