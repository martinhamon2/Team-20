package be.ucll.fs.project.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.fs.project.repository.jdbc.JdbcVulnerableRepository;
import be.ucll.fs.project.unit.model.*;

@RestController
@RequestMapping("/vuln")
public class VulnerableController {

    private final JdbcVulnerableRepository jdbcRepository;

    public VulnerableController(JdbcVulnerableRepository jdbcRepository) {
        this.jdbcRepository = jdbcRepository;
    }

    @GetMapping("/get/user")
    public User findUserByUsername(@RequestParam String username) {
        return jdbcRepository.findUserByUsername(username);
    }
}
