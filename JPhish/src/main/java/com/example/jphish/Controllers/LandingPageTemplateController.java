package com.example.jphish.Controllers;

import com.example.jphish.Models.LandingPageTemplate;
import com.example.jphish.Services.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = {"${app.cors.origin}", "http://localhost:5173"})
@RestController
@RequestMapping("/landingPageTemplate")
public class LandingPageTemplateController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping("/create")
    public ResponseEntity<LandingPageTemplate> createLandingPageTemplate(@RequestPart("landingPageTemplate") LandingPageTemplate landingPageTemplate, @RequestPart("htmlFile") MultipartFile code) throws IOException {
        return ResponseEntity.ok(resourceService.createLandingPageTemplate(landingPageTemplate, code));
    }

    @GetMapping("/all")
    public ResponseEntity<List<LandingPageTemplate>> getAllLandingPageTemplates() {
        return ResponseEntity.ok(resourceService.getAllLandingPageTemplates());
    }

    @GetMapping("/ID/{id}")
    public ResponseEntity<LandingPageTemplate> getLandingPageTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getLandingPageTemplateById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LandingPageTemplate> updateLandingPageTemplate(@PathVariable Long id, @RequestPart("landingPageTemplate") LandingPageTemplate landingPageTemplate, @RequestPart("htmlFile") MultipartFile code) throws IOException {
        return ResponseEntity.ok(resourceService.updateLandingPageTemplate(id, landingPageTemplate, code));
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<Void> deleteLandingPageTemplate(@PathVariable Long id) {
        resourceService.deleteLandingPageTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/updateUrl/{id}")
    public ResponseEntity<LandingPageTemplate> updateLandingPageTemplateUrl(@PathVariable Long id, @RequestParam String url) {
        return ResponseEntity.ok(resourceService.updateLandingPageTemplateUrl(id, url));
    }
}
