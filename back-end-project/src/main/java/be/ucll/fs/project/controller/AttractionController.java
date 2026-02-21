package be.ucll.fs.project.controller;

import be.ucll.fs.project.controller.dto.AttractionInput;
import be.ucll.fs.project.service.AttractionService;
import be.ucll.fs.project.unit.model.Attraction;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
@RestController
@RequestMapping("/attractions")
public class AttractionController {

    private final AttractionService attractionService;

    @Autowired
    public AttractionController(AttractionService attractionService) {
        this.attractionService = attractionService;
    }

    @Operation(summary = "Get all attractions")
    @ApiResponse(responseCode = "200", description = "List of all attractions")
    @GetMapping
    public List<Attraction> getAttractions() {
        return attractionService.getAttractions();
    }

    @Operation(summary = "Get attraction by ID")
    @ApiResponse(responseCode = "200", description = "The found attraction")
    @ApiResponse(responseCode = "404", description = "Attraction not found")
    @GetMapping("/{attractionId}")
    public Attraction getAttractionById(@Parameter(description = "ID of the attraction") @PathVariable Long attractionId) {
        return attractionService.getAttractionById(attractionId);
    }

    @Operation(summary = "Add a spare part to an attraction")
    @ApiResponse(responseCode = "200", description = "Spare part added successfully")
    @PostMapping("/{attractionId}/spareparts/{sparePartId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void addSparePartToAttraction(
            @Parameter(description = "ID of the attraction") @PathVariable Long attractionId,
            @Parameter(description = "ID of the spare part") @PathVariable Long sparePartId) {
        attractionService.addSparePartToAttraction(attractionId, sparePartId);
    }

    @Operation(summary = "Remove a spare part from an attraction")
    @ApiResponse(responseCode = "200", description = "Spare part removed successfully")
    @DeleteMapping("/{attractionId}/spareparts/{sparePartId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void removeSparePartFromAttraction(
            @Parameter(description = "ID of the attraction") @PathVariable Long attractionId,
            @Parameter(description = "ID of the spare part") @PathVariable Long sparePartId) {
        attractionService.removeSparePartFromAttraction(attractionId, sparePartId);
    }

    @Operation(summary = "Change the status of an attraction")
    @ApiResponse(responseCode = "200", description = "The updated attraction with new status")
    @PutMapping("/{attractionId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public Attraction changeAttractionStatus(@Parameter(description = "ID of the attraction") @PathVariable Long attractionId) {
        return attractionService.changeAttractionStatus(attractionId);
    }

    @Operation(summary = "Create a new attraction")
    @ApiResponse(responseCode = "200", description = "The created attraction")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public Attraction createAttraction(@Parameter(description = "Attraction details") @Valid @RequestBody AttractionInput input) {
        return attractionService.createAttraction(input);
    }

    @Operation(summary = "Update attraction details (Wait time, type and park)")
    @PutMapping("/{attractionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Attraction updateAttraction(
            @Parameter(description = "ID of the attraction") @PathVariable Long attractionId,
            @RequestBody AttractionInput input) {
        return attractionService.updateAttractionDetails(attractionId, input);
    }
}