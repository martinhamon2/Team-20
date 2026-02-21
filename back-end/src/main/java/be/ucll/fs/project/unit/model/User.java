package be.ucll.fs.project.unit.model;

import jakarta.persistence.*;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;


@Entity
@Table(name = "user_table")
public class User {

    @Id
    @NotNull(message = "username cannot be null")
    private String username;

    @NotNull(message = "password cannot be null")
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    protected User() {}

    public User(String username, String password, Role role) {
        this.setUsername(username);
        this.setPassword(password);
        this.setRole(role);
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() { return role; }

    public void setRole(Role role) { this.role = role; }
}
