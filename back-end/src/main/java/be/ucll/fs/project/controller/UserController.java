package be.ucll.fs.project.controller;

import be.ucll.fs.project.controller.dto.AuthenticationRequest;
import be.ucll.fs.project.controller.dto.AuthenticationResponse;
import be.ucll.fs.project.controller.dto.ChangePasswordInput;
import be.ucll.fs.project.controller.dto.UserInput;
import be.ucll.fs.project.repository.UserRepository;
import be.ucll.fs.project.service.AvatarService;
import be.ucll.fs.project.service.UserService;
import be.ucll.fs.project.unit.model.Role;
import be.ucll.fs.project.unit.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.apache.tomcat.util.http.SameSiteCookies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Optional;

//@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final AvatarService avatarService;
    private final UserRepository userRepository;

    @Autowired
    public UserController(UserService userService, AvatarService avatarService, UserRepository userRepository) {
        this.userService = userService;
        this.avatarService = avatarService;
        this.userRepository = userRepository;
    }

    // 
    // @Operation(summary = "Get all admins")
    // @ApiResponse(responseCode = "200", description = "List of users with ADMIN role")
    // @GetMapping("/admin")
    // public List<User> getAdmins() {
    //     return userService.getAdmins();
    // }

    @Operation(summary = "Sign up a new user")
    @ApiResponse(responseCode = "200", description = "The created user")
    @ApiResponse(responseCode = "409", description = "Username already exists")
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Parameter(description = "User details for registration") @RequestBody @Valid UserInput userInput) {
        try {
            Role roleToAssign = Role.USER;
            User newUser = userService.signup(roleToAssign, userInput);
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "User login step one")
    @ApiResponse(responseCode = "200", description = "Credentials verified, 2FA code sent")
    @PostMapping("/login")
    public ResponseEntity<Object> authenticate(@RequestBody AuthenticationRequest authenticationRequest) {
        String result = userService.authenticateStepOne(authenticationRequest.username(), authenticationRequest.password());
        return ResponseEntity.ok().body(Map.of("message", result));
    }

    @Operation(summary = "User login step two")
    @ApiResponse(responseCode = "200", description = "2FA verified, HttpOnly cookie set")
    @PostMapping("/verify")
    public ResponseEntity<Object> verify(@RequestParam String username, @RequestParam String code, HttpServletResponse response) {
        var auth = userService.authenticateStepTwo(username, code);

        ResponseCookie cookie = ResponseCookie.from("authToken", auth.token())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(3600)
                .sameSite(SameSiteCookies.NONE.toString())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        AuthenticationResponse strippedResponse = new AuthenticationResponse(auth.message(), null, auth.username(), auth.role());
        return ResponseEntity.ok().body(strippedResponse);
    }

    @PostMapping("/{username}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable String username, @RequestBody Map<String, String> body) {
        String avatarUrl = body.get("avatarUrl");
        if (avatarUrl == null || avatarUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "avatarUrl is required"));
        }
        User user = userRepository.findById(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        try {
            String filename = avatarService.downloadAndStore(username, avatarUrl);
            user.setAvatarPath(filename);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Avatar updated", "path", filename));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to download avatar: " + e.getMessage()));
        }
    }

    @GetMapping("/{username}/avatar")
    public ResponseEntity<Resource> getAvatar(@PathVariable String username) {
        User user = userRepository.findById(username).orElse(null);
        if (user == null || user.getAvatarPath() == null) {
            return ResponseEntity.notFound().build();
        }
        Path filePath = Paths.get(AvatarService.UPLOAD_DIR).resolve(user.getAvatarPath());
        Resource resource = new FileSystemResource(filePath);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = MediaType.IMAGE_JPEG;
        String lower = user.getAvatarPath().toLowerCase();
        if (lower.endsWith(".png"))  mediaType = MediaType.IMAGE_PNG;
        return ResponseEntity.ok().contentType(mediaType).body(resource);
    }

    @PostMapping("/{username}/password")
    public ResponseEntity<?> changePassword(@PathVariable String username, @RequestBody @Valid ChangePasswordInput input) {
        System.out.println("hello");
        try {
            userService.changePassword(username, input.currentPassword(), input.newPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "User logout")
    @ApiResponse(responseCode = "200", description = "Logout successful and cookie cleared")
    @PostMapping("/logout")
    public ResponseEntity<Object> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("authToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    @Operation(summary = "Get logged in user")
    @ApiResponse(responseCode = "200", description = "Gets profile of the logged in user")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public Optional<User> getMe() {
        return userService.getMe();
    }
    
}