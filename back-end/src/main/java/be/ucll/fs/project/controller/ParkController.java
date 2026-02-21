package be.ucll.fs.project.controller;

import be.ucll.fs.project.service.ParkService;
import be.ucll.fs.project.unit.model.Park;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
@RestController
@RequestMapping("/parks")
public class ParkController {

    private final ParkService parkService;

    @Autowired
    public ParkController(ParkService parkService) {
        this.parkService = parkService;
    }

    @Operation(summary = "Get all attractions")
    @ApiResponse(responseCode = "200", description = "List of all parks")
    @GetMapping
    public List<Park> getAllParks() {
        return parkService.getAllParks();
    }
}
