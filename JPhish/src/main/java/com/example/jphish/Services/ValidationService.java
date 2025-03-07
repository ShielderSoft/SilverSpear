package com.example.jphish.Services;

import com.example.jphish.Models.Admin;
import com.example.jphish.Models.Session;
import com.example.jphish.Repositories.AdminRepository;
import com.example.jphish.Repositories.SessionRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
public class ValidationService {

    private AdminRepository adminRepository;
    private SessionRepository sessionRepository;

    private SecretKey key = Keys.hmacShaKeyFor("yLp1Eyu4+wv7LptT79Kb4lAQWxyGSAmqVIpL/gqqyIo="
            .getBytes(StandardCharsets.UTF_8));

    public ValidationService(AdminRepository adminRepository, SessionRepository sessionRepository) {
        this.adminRepository = adminRepository;
        this.sessionRepository = sessionRepository;
    }

    public ResponseEntity<String> validateToken(String token) {
        Optional<Session> validSession = sessionRepository.findByToken(token);
        if (!validSession.isPresent()) {
            System.out.println("Token not found in session repository.");
            return new ResponseEntity<>("User is not Authenticated", HttpStatus.UNAUTHORIZED); }
        System.out.println("Session token from DB "+validSession.get().getToken());
        System.out.println("Received token "+ token);

        String email;
        try{
            Claims claims = Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            email = claims.get("email").toString();

            System.out.println("Extracted Email" + email);

        Optional<Admin> isAdmin = adminRepository.findByEmail(email);
        if(!isAdmin.isPresent()){
            System.out.println("Admin not found for email: " + email);
            return new ResponseEntity<>("Invalid Token", HttpStatus.UNAUTHORIZED); }
        System.out.println(isAdmin.get());
        return new ResponseEntity<>("Admin is Authenticated", HttpStatus.OK);
    } catch (JwtException e) {
            System.out.println("JWT parsing error: " + e.getMessage());
            return new ResponseEntity<>("Invalid Token", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            return new ResponseEntity<>("Invalid Token", HttpStatus.UNAUTHORIZED);
        }

}}
