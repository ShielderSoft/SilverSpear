package com.example.jphish.Controllers;

import com.example.jphish.Models.EmailTemplate;
import com.example.jphish.Services.ResourceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = {"${app.cors.origin}", "http://localhost:5173"})
@RestController
@RequestMapping("/emailTemplate")
public class EmailTemplateController {
    @Autowired
    private ResourceService resourceService;

    @PostMapping("/create")
    public ResponseEntity<EmailTemplate> createEmailTemplate(@RequestPart("emailTemplate") String emailTemplateJson, @RequestPart("bodyFile") MultipartFile body) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        EmailTemplate emailTemplate = objectMapper.readValue(emailTemplateJson, EmailTemplate.class);
        return ResponseEntity.ok(resourceService.createEmailTemplate(emailTemplate, body));
    }

    @GetMapping("/all")
    public ResponseEntity<List<EmailTemplate>> getAllEmailTemplates() {
        return ResponseEntity.ok(resourceService.getAllEmailTemplates());
    }

    @GetMapping("/ID/{id}")
    public ResponseEntity<EmailTemplate> getEmailTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getEmailTemplateById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplate> updateEmailTemplate(@PathVariable Long id, @RequestPart("emailTemplate") EmailTemplate emailTemplate, @RequestPart("bodyFile") MultipartFile body) throws IOException {
        return ResponseEntity.ok(resourceService.updateEmailTemplate(id, emailTemplate, body));
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<Void> deleteEmailTemplate(@PathVariable Long id) {
        resourceService.deleteEmailTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
