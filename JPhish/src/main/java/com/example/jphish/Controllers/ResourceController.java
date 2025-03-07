//package com.example.jphish.Controllers;
//import com.example.jphish.Models.EmailTemplate;
//import com.example.jphish.Models.LandingPageTemplate;
//import com.example.jphish.Models.ResourceEntity;
//import com.example.jphish.Services.ResourceService;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.List;
//
//@CrossOrigin(origins = {"http://147.93.111.204:5173", "http://localhost:5173"})
//@RestController
//@RequestMapping("/resource")
//public class ResourceController {
//
//    @Autowired
//    private ResourceService resourceService;
//
//    //New endpoints for EmailTemplate and LandingPageTemplate CRUD operations
//
//    @PostMapping("/email-template-create")
//    public ResponseEntity<EmailTemplate> createEmailTemplate(@RequestPart("emailTemplate") String emailTemplateJson, @RequestPart("bodyFile") MultipartFile body) throws IOException {
//        ObjectMapper objectMapper = new ObjectMapper();
//        EmailTemplate emailTemplate = objectMapper.readValue(emailTemplateJson, EmailTemplate.class);
//        return ResponseEntity.ok(resourceService.createEmailTemplate(emailTemplate, body));
//    }
//
//    @GetMapping("/email-template-all")
//    public ResponseEntity<List<EmailTemplate>> getAllEmailTemplates() {
//        return ResponseEntity.ok(resourceService.getAllEmailTemplates());
//    }
//
//    @GetMapping("/email-template/{id}")
//    public ResponseEntity<EmailTemplate> getEmailTemplateById(@PathVariable Long id) {
//        return ResponseEntity.ok(resourceService.getEmailTemplateById(id));
//    }
//
//    @PutMapping("/email-template/{id}")
//    public ResponseEntity<EmailTemplate> updateEmailTemplate(@PathVariable Long id, @RequestPart("emailTemplate") EmailTemplate emailTemplate, @RequestPart("bodyFile") MultipartFile body) throws IOException {
//        return ResponseEntity.ok(resourceService.updateEmailTemplate(id, emailTemplate, body));
//    }
//
//    @DeleteMapping("/email-template/{id}")
//    public ResponseEntity<Void> deleteEmailTemplate(@PathVariable Long id) {
//        resourceService.deleteEmailTemplate(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    @PostMapping("/landing-page-template/create")
//    public ResponseEntity<LandingPageTemplate> createLandingPageTemplate(@RequestPart("landingPageTemplate") LandingPageTemplate landingPageTemplate, @RequestPart("htmlFile") MultipartFile code) throws IOException {
//        return ResponseEntity.ok(resourceService.createLandingPageTemplate(landingPageTemplate, code));
//    }
//
//    @GetMapping("/landing-page-template/all")
//    public ResponseEntity<List<LandingPageTemplate>> getAllLandingPageTemplates() {
//        return ResponseEntity.ok(resourceService.getAllLandingPageTemplates());
//    }
//
//    @GetMapping("/landing-page-template/{id}")
//    public ResponseEntity<LandingPageTemplate> getLandingPageTemplateById(@PathVariable Long id) {
//        return ResponseEntity.ok(resourceService.getLandingPageTemplateById(id));
//    }
//
//    @PutMapping("/landing-page-template/{id}")
//    public ResponseEntity<LandingPageTemplate> updateLandingPageTemplate(@PathVariable Long id, @RequestPart("landingPageTemplate") LandingPageTemplate landingPageTemplate, @RequestPart("htmlFile") MultipartFile code) throws IOException {
//        return ResponseEntity.ok(resourceService.updateLandingPageTemplate(id, landingPageTemplate, code));
//    }
//
//    @DeleteMapping("/landing-page-template/{id}")
//    public ResponseEntity<Void> deleteLandingPageTemplate(@PathVariable Long id) {
//        resourceService.deleteLandingPageTemplate(id);
//        return ResponseEntity.noContent().build();
//    }
//}
