package be.ucll.controller.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import be.ucll.model.Registration;

public record SessionDTO(
                String id,
                String description,
                String type,
                String category,
                LocalDate beginDate,
                LocalDate endDate,
                LocalTime beginTime,
                LocalTime endTime,
                String location,
                String mapUrl,
                int maxCapacity,
                List<Registration> registrations) {
}
