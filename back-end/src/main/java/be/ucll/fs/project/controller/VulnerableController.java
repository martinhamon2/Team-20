package be.ucll.fs.project.controller;

import java.net.InetAddress;
import java.net.URI;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import be.ucll.fs.project.repository.jdbc.JdbcVulnerableRepository;
import be.ucll.fs.project.unit.model.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


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

    @GetMapping("/get/users")
    public List<User> findUsersByUsername(@RequestParam String username) {
        return jdbcRepository.findUsersByUsername(username);
    }

    

    @PostMapping("/url-validate")
    public String urlValidate(@RequestBody String url) {
      try {
          URI uri = new URI(url.trim());
          String scheme = uri.getScheme();
          String host = uri.getHost();

          if (host == null || scheme == null) return "reject";
          if (!scheme.equals("http") && !scheme.equals("https")) return "reject";

          return "allow";
      } catch (Exception e) {
          return "reject";
      }
    }
    
}
