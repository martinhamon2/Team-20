package be.ucll.service;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import be.ucll.model.User;

import java.util.Collection;
import java.util.List;

public record UserDetailsImpl(User user) implements UserDetails {
    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(user.getRole().toGrantedAuthority());
    }
}
