package com.example.jphish.Controllers;

import com.example.jphish.Services.JwtService;
import com.example.jphish.Services.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private ValidationService validationService;
    private JwtService jwtService;

    public AuthController(ValidationService validationService, JwtService jwtService) {
        this.validationService = validationService;
        this.jwtService = jwtService;
    }

    // New endpoint to validate tokens and return clientId
    @PostMapping("/validateToken")
    public ResponseEntity<?> validateTokenAndGetClientId(
            @RequestBody Map<String, String> tokenRequest,
            @RequestHeader("clearance") String clearance) {

        String token = tokenRequest.get("token");

        if (token == null) {
            return new ResponseEntity<>("Token required", HttpStatus.BAD_REQUEST);
        }

        Map<String, Object> response = new HashMap<>();

        // Admin authentication flow
        if ("Admin".equals(clearance)) {
            ResponseEntity<String> validationResponse = validationService.validateToken(token);
            if (validationResponse.getStatusCode() == HttpStatus.OK) {
                response.put("clientId", 0L);
                return new ResponseEntity<>(response, HttpStatus.OK);
            }
        }
        // Client authentication flow
        else if ("Client".equals(clearance)) {
            try {
                Long clientId = jwtService.extractClientId(token);
                response.put("clientId", clientId);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } catch (Exception e) {
                return new ResponseEntity<>("Invalid client token", HttpStatus.UNAUTHORIZED);
            }
        }

        return new ResponseEntity<>("Invalid token", HttpStatus.UNAUTHORIZED);
    }

    // Keep the original endpoint for backward compatibility
    @PostMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestBody Map<String, String> tokenRequest) {
        String token = tokenRequest.get("token");

        // Log what we received and extracted
        System.out.println("Auth controller received payload: " + tokenRequest);
        System.out.println("Extracted token: " + (token != null ? token.substring(0, Math.min(20, token.length())) : "null"));

        if (token == null) {
            return new ResponseEntity<>("Token required", HttpStatus.BAD_REQUEST);
        }

        return validationService.validateToken(token);
    }
}