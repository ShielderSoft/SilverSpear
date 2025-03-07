package com.example.jphish.Services;

import com.example.jphish.Models.EmailTemplate;
import com.example.jphish.Models.LandingPageTemplate;
import com.example.jphish.Models.ResourceEntity;
import com.example.jphish.Repositories.EmailTemplateRepository;
import com.example.jphish.Repositories.LandingPageTemplateRepository;
import com.example.jphish.Repositories.ResourceRepository;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;
    @Autowired
    private EmailTemplateRepository emailTemplateRepository;
    @Autowired
    private LandingPageTemplateRepository landingPageTemplateRepository;


    //New methods for EmailTemplate and LandingPageTemplate CRUD operations

    public EmailTemplate createEmailTemplate(EmailTemplate emailTemplate, MultipartFile body) throws IOException {
        emailTemplate.setBody(body.getBytes());
        return emailTemplateRepository.save(emailTemplate);
    }

    public List<EmailTemplate> getAllEmailTemplates() {
        return emailTemplateRepository.findAll();
    }

    public EmailTemplate getEmailTemplateById(Long id) {
        return emailTemplateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("EmailTemplate not found with id: " + id));
    }

    public EmailTemplate updateEmailTemplate(Long id, EmailTemplate updatedEmailTemplate, MultipartFile body) throws IOException {
        EmailTemplate emailTemplate = getEmailTemplateById(id);
        emailTemplate.setName(updatedEmailTemplate.getName());
        emailTemplate.setSubject(updatedEmailTemplate.getSubject());
        emailTemplate.setBody(body.getBytes());
        return emailTemplateRepository.save(emailTemplate);
    }

    public void deleteEmailTemplate(Long id) {
        emailTemplateRepository.deleteById(id);
    }


    public LandingPageTemplate createLandingPageTemplate(LandingPageTemplate landingPageTemplate, MultipartFile code) throws IOException {
        landingPageTemplate.setCode(code.getBytes());
        return landingPageTemplateRepository.save(landingPageTemplate);
    }

    public List<LandingPageTemplate> getAllLandingPageTemplates() {
        return landingPageTemplateRepository.findAll();
    }

    public LandingPageTemplate getLandingPageTemplateById(Long id) {
        return landingPageTemplateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("LandingPageTemplate not found with id: " + id));
    }

    public LandingPageTemplate updateLandingPageTemplate(Long id, LandingPageTemplate updatedLandingPageTemplate, MultipartFile code) throws IOException {
        LandingPageTemplate landingPageTemplate = getLandingPageTemplateById(id);
        landingPageTemplate.setName(updatedLandingPageTemplate.getName());
        landingPageTemplate.setCode(code.getBytes());
        return landingPageTemplateRepository.save(landingPageTemplate);
    }

    public void deleteLandingPageTemplate(Long id) {
        landingPageTemplateRepository.deleteById(id);
    }
}
