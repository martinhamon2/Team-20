package be.ucll.fs.project.controller;

import be.ucll.fs.project.service.SparePartService;
import be.ucll.fs.project.unit.model.SparePart;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
@RestController
@RequestMapping("/spareParts")
public class SparePartController {

    private final SparePartService sparePartService;

    @Autowired
    public SparePartController(SparePartService sparePartService) {
        this.sparePartService = sparePartService;
    }

    @Operation(summary = "Get all spare parts")
    @ApiResponse(responseCode = "200", description = "List of all spare parts")
    @GetMapping
    public List<SparePart> getAllSpareParts(){
        return sparePartService.getAllSpareParts();
    }

    @Operation(summary = "Get spare part by ID")
    @ApiResponse(responseCode = "200", description = "The found spare part")
    @GetMapping("/{sparePartId}")
    public SparePart getSparePartById(@Parameter(description = "ID of the spare part") @PathVariable Long sparePartId) {
        return sparePartService.getSparePartById(sparePartId);
    }

}
