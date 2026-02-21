package be.ucll.fs.project;

import be.ucll.fs.project.repository.AttractionRepository;
import be.ucll.fs.project.repository.ParkRepository;
import be.ucll.fs.project.repository.SparePartRepository;
import be.ucll.fs.project.repository.UserRepository;
import be.ucll.fs.project.unit.model.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;

@Component
public class DbInitializer {

    private final PasswordEncoder passwordEncoder;
    public AttractionRepository attractionRepository;
    public ParkRepository parkRepository;
    public SparePartRepository sparePartRepository;
    public UserRepository userRepository;

    @Autowired
    public DbInitializer(AttractionRepository attractionRepository, ParkRepository parkRepository, SparePartRepository sparePartRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.attractionRepository = attractionRepository;
        this.parkRepository = parkRepository;
        this.sparePartRepository = sparePartRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void initialize() {
        //------------PARKS AND ATTRACTIONS-------------------------------------PARKS AND ATTRACTIONS----------------------------------PARKS AND ATTRACTIONS-----------------------
        Park park1 = new Park("Walibi");
        Park park2 = new Park("Bobejaanland");
        Park park3 = new Park("Testland");

        Attraction attraction1 = new Attraction("roller coaster", "Klondike", null, false, 12, 130);
        Attraction attraction2 = new Attraction("roller coaster", "The Goliath", null, false, 14, 150);
        Attraction attraction3 = new Attraction("water ride", "Vortex", LocalTime.of(1, 20), true, 8, 100);
        Attraction attraction4 = new Attraction("dark ride", "Dragon's Flight", LocalTime.of(0, 25), true, 6, 110);
        Attraction attraction5 = new Attraction("water ride", "Splash Mountain", LocalTime.of(0, 45), true, 5, 100);
        Attraction attraction6 = new Attraction("thrill ride", "Vortex", LocalTime.of(1, 10), false, 16, 140);
        Attraction attraction7 = new Attraction("roller coaster", "Thunder Strike", LocalTime.of(0, 35), false, 12, 125);
        Attraction attraction8 = new Attraction("dark ride", "Haunted Mansion", LocalTime.of(0, 20), true, 0, 0);

        attraction1.setStatus(Status.UP);
        attraction2.setStatus(Status.UP);
        attraction3.setStatus(Status.DOWN);
        attraction4.setStatus(Status.UP);
        attraction5.setStatus(Status.UP);
        attraction6.setStatus(Status.MAINTENANCE);
        attraction7.setStatus(Status.MAINTENANCE);
        attraction8.setStatus(Status.DOWN);

        attraction1.setPark(park1);
        attraction2.setPark(park1);
        attraction3.setPark(park1);
        attraction4.setPark(park1);
        attraction5.setPark(park2);
        attraction6.setPark(park2);
        attraction7.setPark(park2);
        attraction8.setPark(park3);
        park1.setAttractions(List.of(attraction1, attraction2, attraction3, attraction4));
        park2.setAttractions(List.of(attraction5, attraction6, attraction7));
        park3.setAttractions(List.of(attraction8));

        parkRepository.save(park1);
        parkRepository.save(park2);
        parkRepository.save(park3);

        //--------------SPARE PARTS---------------------------------------SPARE PARTS--------------------------------------------SPARE PARTS------------------
        SparePart sparePart1 = new SparePart("MOT-001", "Electric Motor");
        SparePart sparePart2 = new SparePart("HYD-002", "Hydraulic Cylinder");
        SparePart sparePart3 = new SparePart("CHN-003", "Safety Chain");
        SparePart sparePart4 = new SparePart("SNS-004", "Motion Sensor");
        SparePart sparePart5 = new SparePart("WHL-005", "Track Wheel");

        sparePart1.addAttractionList(List.of(attraction1, attraction2, attraction6, attraction7, attraction8));
        attraction1.setSpareParts(List.of(sparePart1));
        attraction2.setSpareParts(List.of(sparePart1));
        attraction6.setSpareParts(List.of(sparePart1));
        attraction7.setSpareParts(List.of(sparePart1));
        attraction8.setSpareParts(List.of(sparePart1));

        sparePart2.addAttractionList(List.of(attraction2, attraction6, attraction7));
        attraction2.setSpareParts(List.of(sparePart2));
        attraction6.setSpareParts(List.of(sparePart2));
        attraction7.setSpareParts(List.of(sparePart2));

        sparePart3.addAttractionList(List.of(attraction1, attraction2, attraction6, attraction7));
        attraction1.setSpareParts(List.of(sparePart3));
        attraction2.setSpareParts(List.of(sparePart3));
        attraction6.setSpareParts(List.of(sparePart3));
        attraction7.setSpareParts(List.of(sparePart3));

        sparePart4.addAttractionList(List.of(attraction3, attraction4, attraction5, attraction8));
        attraction3.setSpareParts(List.of(sparePart4));
        attraction4.setSpareParts(List.of(sparePart4));
        attraction5.setSpareParts(List.of(sparePart4));
        attraction8.setSpareParts(List.of(sparePart4));

        sparePart5.addAttractionList(List.of(attraction2));
        attraction2.setSpareParts(List.of(sparePart5));

        sparePartRepository.save(sparePart1);
        sparePartRepository.save(sparePart2);
        sparePartRepository.save(sparePart3);
        sparePartRepository.save(sparePart4);
        sparePartRepository.save(sparePart5);

        attractionRepository.save(attraction1);
        attractionRepository.save(attraction2);
        attractionRepository.save(attraction3);
        attractionRepository.save(attraction4);
        attractionRepository.save(attraction5);
        attractionRepository.save(attraction6);
        attractionRepository.save(attraction7);
        attractionRepository.save(attraction8);

        //-------------USERS------------------------------------USERS------------------------------------USERS---------------------
        User user1 = new User("admin",
                passwordEncoder.encode("admin123"),
                Role.ADMIN);
        User user2 = new User("admin1",
                passwordEncoder.encode("admin1234"),
                Role.ADMIN);
        User user3 = new User("staff",
                passwordEncoder.encode("staff"),
                Role.STAFF);
        User user4 = new User("visitor",
                passwordEncoder.encode("visitor"),
                Role.USER);

        User userFinal1 = new User("frits",
                passwordEncoder.encode("frits123"),
                Role.ADMIN);

        User userFinal2 = new User("frans",
                passwordEncoder.encode("frans123"),
                Role.STAFF);

        User userFinal3 = new User("jan",
                passwordEncoder.encode("jan123"),
                Role.USER);


        userRepository.save(user1);
        userRepository.save(user2);
        userRepository.save(user3);
        userRepository.save(user4);
        userRepository.save(userFinal1);
        userRepository.save(userFinal2);
        userRepository.save(userFinal3);
    }
}
