package be.ucll.fs.project.unit.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class SparePart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String type;

    @ManyToMany(mappedBy = "spareParts")
    @JsonBackReference
    private List<Attraction> attractionList;

    protected SparePart() {}

    public SparePart(String name, String type) {
        this.setName(name);
        this.setType(type);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Attraction> getAttractionList() {
        return attractionList;
    }

    public void addAttractionList(List<Attraction> attractionList) {
        if (this.attractionList == null) {
            this.attractionList = new ArrayList<>(attractionList);
        }
        else {
            this.attractionList.addAll(attractionList);
        }
    }
}
