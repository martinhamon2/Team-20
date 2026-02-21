package be.ucll.controller.dto;

import be.ucll.model.Registration;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

import java.util.List;
import java.util.stream.Collectors;

@JacksonXmlRootElement(localName = "bestand")
public class VerderstuderenFileDTO extends RegistrationFileDTO {

    @JacksonXmlProperty(localName = "Verderstuderen")
    private List<Verderstudeer> verderstudeer;

    public VerderstuderenFileDTO(List<Registration> registrations) {
        super(registrations);
        this.verderstudeer = registrations.stream()
                .map(Verderstudeer::new)
                .collect(Collectors.toList());
    }
}