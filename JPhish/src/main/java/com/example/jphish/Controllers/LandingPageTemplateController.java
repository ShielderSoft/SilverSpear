package com.example.jphish.Controllers;

import com.example.jphish.Models.LandingPageTemplate;
import com.example.jphish.Services.JwtService;
import com.example.jphish.Services.ResourceService;
import com.example.jphish.Services.ValidationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/landingPageTemplate")
public class LandingPageTemplateController {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ValidationService validationService;

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
    public ResponseEntity<?> createLandingPageTemplate(
            @RequestPart("landingPageTemplate") LandingPageTemplate landingPageTemplate,
            @RequestPart("htmlFile") MultipartFile code,
            HttpServletRequest request) throws IOException {

        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        return ResponseEntity.ok(resourceService.createLandingPageTemplate(landingPageTemplate, code, clientId));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllLandingPageTemplates(HttpServletRequest request) {
        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        return ResponseEntity.ok(resourceService.getAllLandingPageTemplates(clientId));
    }

    @GetMapping("/ID/{id}")
    public ResponseEntity<?> getLandingPageTemplateById(@PathVariable Long id, HttpServletRequest request) {
        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        try {
            return ResponseEntity.ok(resourceService.getLandingPageTemplateById(id, clientId));
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLandingPageTemplate(
            @PathVariable Long id,
            @RequestPart("landingPageTemplate") LandingPageTemplate landingPageTemplate,
            @RequestPart("htmlFile") MultipartFile code,
            HttpServletRequest request) throws IOException {

        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        try {
            return ResponseEntity.ok(resourceService.updateLandingPageTemplate(id, landingPageTemplate, code, clientId));
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> deleteLandingPageTemplate(@PathVariable Long id, HttpServletRequest request) {
        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        try {
            resourceService.deleteLandingPageTemplate(id, clientId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/updateUrl/{id}")
    public ResponseEntity<?> updateLandingPageTemplateUrl(
            @PathVariable Long id,
            @RequestParam String url,
            HttpServletRequest request) {

        Long clientId = extractClientId(request);
        if (clientId == null) {
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        try {
            return ResponseEntity.ok(resourceService.updateLandingPageTemplateUrl(id, url, clientId));
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}