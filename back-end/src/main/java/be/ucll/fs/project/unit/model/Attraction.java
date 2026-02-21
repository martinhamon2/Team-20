package be.ucll.fs.project.unit.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String type;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalTime waitTime;

    private boolean accessibility;

    private int minAge;

    private int minHeight;

    @ManyToOne
    @JoinColumn(name = "park_id")
    @JsonManagedReference
    @NotNull
    private Park park;

    @ManyToMany
    @JoinTable(
            name = "attraction_spare_part",
            joinColumns = @JoinColumn(name = "attraction_id"),
            inverseJoinColumns = @JoinColumn(name = "spare_part_id")
    )
    @JsonManagedReference
    private List<SparePart> spareParts;

    protected Attraction() {}

    public Attraction(String type, String name, LocalTime waitTime, boolean accessibility, int minAge, int minimumHeight) {
        this.setType(type);
        this.setName(name);
        this.setWaitTime(waitTime);
        this.setAccessibility(accessibility);
        this.setMinAge(minAge);
        this.setMinHeight(minimumHeight);
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalTime getWaitTime() {
        return waitTime;
    }

    public void setWaitTime(LocalTime waitTime) {
        this.waitTime = waitTime;
    }

    public boolean isAccessibility() {
        return accessibility;
    }

    public void setAccessibility(boolean accessibility) {
        this.accessibility = accessibility;
    }

    public int getMinAge() {
        return minAge;
    }

    public void setMinAge(int minAge) {
        this.minAge = minAge;
    }

    public int getMinHeight() {
        return minHeight;
    }

    public void setMinHeight(int minHeight) {
        this.minHeight = minHeight;
    }

    public Park getPark() {
        return park;
    }

    public void setPark(Park park) {
        this.park = park;
    }

    public List<SparePart> getSpareParts() {
        return spareParts;
    }

    public void setSpareParts(List<SparePart> spareParts) {
        if (this.spareParts == null) {
            this.spareParts = new ArrayList<>(spareParts);
        }
        else {
            this.spareParts.addAll(spareParts);
        }
    }

    public void rotateStatus() {
        if (this.status == Status.UP) {
            this.status = Status.DOWN;
        } else if (this.status == Status.DOWN) {
            this.status = Status.MAINTENANCE;
        } else {
            this.status = Status.UP;
        }

        if (this.status != Status.UP) {
            this.waitTime = null;
        }
    }
}
