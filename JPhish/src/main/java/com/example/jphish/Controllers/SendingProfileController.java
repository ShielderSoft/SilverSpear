package com.example.jphish.Controllers;

import com.example.jphish.Models.SendingProfile;
import com.example.jphish.Services.JwtService;
import com.example.jphish.Services.SendingProfileService;
import com.example.jphish.Services.ValidationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/profile")
public class SendingProfileController {
    private SendingProfileService sendingProfileService;
    private JwtService jwtService;
    private ValidationService validationService;

    public SendingProfileController(SendingProfileService sendingProfileService,
                                    JwtService jwtService,
                                    ValidationService validationService) {
        this.sendingProfileService = sendingProfileService;
        this.jwtService = jwtService;
        this.validationService = validationService;
    }

    // Helper method to extract clientId based on clearance
    private Long extractClientId(HttpServletRequest request) {
        String clearance = request.getHeader("clearance");
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // Admin authentication flow
            if ("Admin".equals(clearance)) {
                ResponseEntity<String> response = validationService.validateToken(token);
                if (response.getStatusCode() == HttpStatus.OK) {
                    return 0L; // Admin access with clientId 0
                }
            }
            // Client authentication flow
            else if ("Client".equals(clearance)) {
                try {
                    return jwtService.extractClientId(token);
                } catch (Exception e) {
                    // Token validation failed
                    return null;
                }
            }
        }
        return null; // Invalid authentication
    }

    @PostMapping("/create")
    public ResponseEntity<String> createProfile(@RequestBody SendingProfile sendingProfile,
                                                HttpServletRequest request) throws Exception {
        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        sendingProfileService.createProfile(sendingProfile, clientId);
        return new ResponseEntity<>("Profile created successfully", HttpStatus.OK);
    }

    @GetMapping("/get")
    public ResponseEntity<List<SendingProfile>> getAllProfiles(HttpServletRequest request) {
        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<SendingProfile> allProfiles = sendingProfileService.allProfile(clientId);
        return new ResponseEntity<>(allProfiles, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SendingProfile> getProfileById(@PathVariable Long id,
                                                         HttpServletRequest request) {
        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        SendingProfile profile = sendingProfileService.getProfileById(id, clientId);
        if (profile != null) {
            return new ResponseEntity<>(profile, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProfile(@PathVariable Long id,
                                                HttpServletRequest request) {
        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        try {
            sendingProfileService.deleteProfile(id, clientId);
            return new ResponseEntity<>("Profile deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}