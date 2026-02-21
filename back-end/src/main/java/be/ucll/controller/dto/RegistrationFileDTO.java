package be.ucll.controller.dto;

import be.ucll.model.Registration;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import java.util.List;
import java.util.stream.Collectors;

@JacksonXmlRootElement(localName = "bestand")
public class RegistrationFileDTO {

    public static class Verderstudeer {

        @JacksonXmlProperty(localName = "student")
        private Student student;

        @JacksonXmlProperty(localName = "event")
        private Event event;

        public Verderstudeer(Registration reg) {
            this.student = new Student(reg);
            this.event = new Event(reg.getSessionIds());
        }
    }

    public static class Student {
        @JacksonXmlProperty(localName = "volgnummer")
        private Long volgnummer;

        @JacksonXmlProperty(localName = "voornaam")
        private String voornaam;

        @JacksonXmlProperty(localName = "naam")
        private String naam;

        @JacksonXmlProperty(localName = "addres")
        private String addres = "Unknown";

        @JacksonXmlProperty(localName = "nummer")
        private String nummer = "Unknown";

        @JacksonXmlProperty(localName = "postcode")
        private Integer postcode;

        @JacksonXmlProperty(localName = "plaats")
        private String plaats;

        @JacksonXmlProperty(localName = "land")
        private String land = "BE";

        @JacksonXmlProperty(localName = "email")
        private String email;

        @JacksonXmlProperty(localName = "onderwijsinstelling")
        private String onderwijsinstelling;

        @JacksonXmlProperty(localName = "correspondentie_taal")
        private String correspondentie_taal = "NL";

        public Student(Registration registration) {
            this.volgnummer = registration.getId();
            this.voornaam = registration.getFirstName();
            this.naam = registration.getLastName();
            this.addres  = registration.getAddress();
            this.nummer = registration.getPhoneNumber();
            this.postcode = registration.getPostcode();
            this.plaats = registration.getCounty();
            this.email = registration.getEmail();
            this.onderwijsinstelling = registration.getSchool();
        }
    }

    public static class Event {

        @JacksonXmlElementWrapper(localName = "sessie", useWrapping = false)
        private List<Session> sessie;

        public Event(List<String> sessionIds) {
            this.sessie = sessionIds.stream().map(Session::new).collect(Collectors.toList());
        }
    }

    public static class Session {
        @JacksonXmlProperty(localName = "sessieid")
        private String sessieid;

        public Session(String sessionId) {
            this.sessieid = sessionId;
        }
    }

    @JacksonXmlProperty(localName = "Verderstuderen")

    private List<Verderstudeer> verderstudeer;



    public RegistrationFileDTO(List<Registration> registrations) {

        this.verderstudeer = registrations.stream()
                .map(Verderstudeer::new)
                .collect(Collectors.toList());
    }
}