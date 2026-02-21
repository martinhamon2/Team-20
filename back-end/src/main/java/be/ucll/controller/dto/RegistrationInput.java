package be.ucll.controller.dto;

import java.util.List;

public record RegistrationInput(
                String firstName,
                String lastName,
                String address,
                String county,
                Integer postcode,
                String phoneNumber,
                String email,
                String school,
                String correspondenceLanguage,
                Integer startYear,
                String dateOfBirth,
                List<String> sessionIds) {
}
