package be.ucll.fs.project.config;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.google.common.util.concurrent.RateLimiter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws ServletException, IOException {
        String ip = request.getRemoteAddr();
        RateLimiter limiter = limiters.computeIfAbsent(ip,k -> RateLimiter.create(10.0));
        if (limiter.tryAcquire()) {chain.doFilter(request, response);} else {
            response.setStatus(429);
            response.getWriter().write("Too many requests");
        }
    }
}