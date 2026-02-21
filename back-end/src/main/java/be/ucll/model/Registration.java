package be.ucll.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Firstname should not be blank.")
    private String firstName;

    @NotBlank(message = "Lastname should not be blank.")
    private String lastName;

    @NotBlank(message = "Address should not be blank.")
    private String address;

    @NotBlank(message = "County should not be blank.")
    private String county;

    @NotNull(message = "Postcode should not be empty.")
    private Integer postcode;

    @NotBlank(message = "Phone number should not be blank.")
    private String phoneNumber;

    @Email(message = "Email should be valid")
    private String email;

    private String school;

    @NotNull(message = "IsPresent should not be null.")
    private Boolean isPresent = false;

    @NotBlank(message = "Correspondence language should not be blank.")
    String correspondenceLanguage;

    Integer startYear;

    @NotBlank(message = "Date of birth should not be blank.")
    String dateOfBirth;

    @ElementCollection
    @CollectionTable(name = "registration_session_ids", joinColumns = @JoinColumn(name = "registration_id"))
    @Column(name = "session_id")
    private List<String> sessionIds = new ArrayList<>();

    protected Registration() {
    }

    public Registration(String firstName, String lastName, String address, String county,
            Integer postcode,
            String phoneNumber, String email, String school, String correspondenceLanguage, Integer startYear,
            String dateOfBirth) {
        setFirstName(firstName);
        setLastName(lastName);
        setAddress(address);
        setCounty(county);
        setPostcode(postcode);
        setPhoneNumber(phoneNumber);
        setEmail(email);
        setSchool(school);
        setCorrespondenceLanguage(correspondenceLanguage);
        setStartYear(startYear);
        setDateOfBirth(dateOfBirth);
        setIsPresent(false);

    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCounty() {
        return county;
    }

    public void setCounty(String county) {
        this.county = county;
    }

    public Integer getPostcode() {
        return postcode;
    }

    public void setPostcode(Integer postcode) {
        this.postcode = postcode;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public String getCorrespondenceLanguage() {
        return correspondenceLanguage;
    }

    public void setCorrespondenceLanguage(String correspondenceLanguage) {
        this.correspondenceLanguage = correspondenceLanguage;
    }

    public Integer getStartYear() {
        return startYear;
    }

    public void setStartYear(Integer startYear) {
        this.startYear = startYear;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<String> getSessionIds() {
        return sessionIds;
    }

    public void setSessionIds(List<String> sessionIds) {
        this.sessionIds = sessionIds;
    }

    public void addSessionId(String sessionId) {
        sessionIds.add(sessionId);
    }

    public Boolean getIsPresent() {
        return isPresent;
    }

    public void setIsPresent(Boolean isPresent) {
        this.isPresent = isPresent;
    }
}
