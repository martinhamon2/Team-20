package be.ucll.controller.dto;

import be.ucll.model.Registration;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

import java.util.List;
import java.util.stream.Collectors;

@JacksonXmlRootElement(localName = "bestand")
public class OpenlesdagenFileDTO extends RegistrationFileDTO {

    @JacksonXmlProperty(localName = "Openlesdagen")
    private List<Verderstudeer> verderstudeer;

    public OpenlesdagenFileDTO(List<Registration> registrations) {
        super(registrations);
        this.verderstudeer = registrations.stream()
                .map(Verderstudeer::new)
                .collect(Collectors.toList());
    }
}
