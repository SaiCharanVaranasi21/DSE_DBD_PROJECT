package mth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import mth.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        String token = null;

        // Try extracting from Authorization header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            // Support fallback Token header
            token = request.getHeader("Token");
        }

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Map<String, Object> claims = jwtService.validateJWT(token);
                if (claims != null && claims.get("username") != null) {
                    String username = (String) claims.get("username");
                    
                    // Map role ID to String
                    Object roleObj = claims.get("role");
                    String roleName = "USER";
                    if (roleObj != null) {
                        int roleId = Integer.parseInt(roleObj.toString());
                        if (roleId == 2) {
                            roleName = "ADMIN";
                        } else if (roleId == 3) {
                            roleName = "MANAGER";
                        }
                    }

                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + roleName);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username, null, Collections.singletonList(authority));
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // Let request proceed (unauthorized paths will be caught by SecurityFilterChain)
                logger.warn("JWT verification exception: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
