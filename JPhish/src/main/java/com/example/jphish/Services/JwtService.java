package com.example.jphish.Services;

import com.example.jphish.Models.Token;
import com.example.jphish.Repositories.TokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    // 8 hours in milliseconds
    private final long jwtExpiration = 8 * 60 * 60 * 1000;

    private final TokenRepository tokenRepository;

    @Autowired
    public JwtService(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Transactional
    public String generateToken(Long id, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", id);
        claims.put("role", role);

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        String jwtToken = Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        // Store token in database
        Token token = new Token();
        token.setToken(jwtToken);
        token.setExpiryDate(expiryDate);
        token.setRevoked(false);

        tokenRepository.save(token);

        return jwtToken;
    }

    // New methods for client token validation
    public ResponseEntity<String> validateClientToken(String token) {
        try {
            Claims claims = extractAllClaims(token);

            // Check if the token is expired
            if (claims.getExpiration().before(new Date())) {
                return new ResponseEntity<>("Token expired", HttpStatus.UNAUTHORIZED);
            }

            return new ResponseEntity<>("Token is valid", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid token: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    public Long extractClientId(String token) {
        try {
            Claims claims = extractAllClaims(token);
            String role = claims.get("role", String.class);

            // Verify this is a client token
            if (!"CLIENT".equals(role)) {
                throw new RuntimeException("Not a client token");
            }

            return claims.get("id", Long.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract client ID: " + e.getMessage());
        }
    }

    public Claims extractAllClaims(String token) {
        Key key = getSigningKey();
        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}