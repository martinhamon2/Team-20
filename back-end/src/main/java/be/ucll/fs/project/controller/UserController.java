package be.ucll.fs.project.controller;

import be.ucll.fs.project.controller.dto.AuthenticationRequest;
import be.ucll.fs.project.controller.dto.AuthenticationResponse;
import be.ucll.fs.project.controller.dto.UserInput;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

//@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get all admins")
    @ApiResponse(responseCode = "200", description = "List of users with ADMIN role")
    @GetMapping("/admin")
    public List<User> getAdmins() {
        return userService.getAdmins();
    }

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

    @Operation(summary = "User login")
    @ApiResponse(responseCode = "200", description = "Login successful, HttpOnly cookie set")
    @PostMapping("/login")
    public ResponseEntity<Object> authenticate(@RequestBody AuthenticationRequest authenticationRequest, HttpServletResponse response){
        var auth = userService.authenticate(authenticationRequest.username(), authenticationRequest.password());

        ResponseCookie cookie = ResponseCookie.from("authToken", auth.token())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(3600)
                .sameSite(SameSiteCookies.NONE.toString())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Only send the token via the cookie, not in the body
        auth = new AuthenticationResponse(auth.message(), null, auth.username(), auth.role());
        return ResponseEntity.ok().body(auth);
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
