package be.ucll.fs.project.unit.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class TwoFactorAuthCode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String code;
    private LocalDateTime expiryDate;

    public TwoFactorAuthCode() {}
    public TwoFactorAuthCode(String username, String code) {
        this.username = username;
        this.code = code;
        this.expiryDate = LocalDateTime.now().plusMinutes(5);
    }

    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return this.username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getCode() { return this.code; }
    public void setCode( String code ) { this.code = code; }

    public void setExpiryDate( LocalDateTime date) { this.expiryDate = date; }
    public boolean isExpired() { return LocalDateTime.now().isAfter(expiryDate); }
}