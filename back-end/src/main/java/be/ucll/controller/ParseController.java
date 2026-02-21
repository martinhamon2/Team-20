package be.ucll.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.model.Event;
import be.ucll.service.ParseService;

@RestController
@RequestMapping("/parser")
public class ParseController {
    private final ParseService parseService;

    public ParseController(ParseService parseService) {
        this.parseService = parseService;
    }

    @PostMapping("/upload")
    public Event uploadXml(@RequestParam("file") MultipartFile file) throws Exception {
        return parseService.uploadXml(file);
    }
}
