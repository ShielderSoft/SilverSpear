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

    public EmailTemplate createEmailTemplate(EmailTemplate emailTemplate, MultipartFile body, Long clientId) throws IOException {
        emailTemplate.setBody(body.getBytes());
        emailTemplate.setClientId(clientId);
        return emailTemplateRepository.save(emailTemplate);
    }

    public List<EmailTemplate> getAllEmailTemplates(Long clientId) {
        // If admin (clientId = 0L), return all templates
        if (clientId == 0L) {
            return emailTemplateRepository.findAll();
        }
        // For regular clients, filter by clientId
        return emailTemplateRepository.findByClientId(clientId);
    }

    public EmailTemplate getEmailTemplateById(Long id, Long clientId) {
        EmailTemplate template = emailTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmailTemplate not found with id: " + id));

        // If admin (clientId = 0L) or matching clientId, return the template
        if (clientId == 0L || template.getClientId().equals(clientId)) {
            return template;
        }
        throw new ResourceNotFoundException("EmailTemplate not found with id: " + id + " for this client");
    }

    public EmailTemplate updateEmailTemplate(Long id, EmailTemplate updatedEmailTemplate, MultipartFile body, Long clientId) throws IOException {
        EmailTemplate emailTemplate = getEmailTemplateById(id, clientId);
        emailTemplate.setName(updatedEmailTemplate.getName());
        emailTemplate.setSubject(updatedEmailTemplate.getSubject());
        emailTemplate.setBody(body.getBytes());
        return emailTemplateRepository.save(emailTemplate);
    }

    public void deleteEmailTemplate(Long id, Long clientId) {
        EmailTemplate template = getEmailTemplateById(id, clientId);
        emailTemplateRepository.deleteById(id);
    }

    public LandingPageTemplate createLandingPageTemplate(LandingPageTemplate landingPageTemplate, MultipartFile code, Long clientId) throws IOException {
        landingPageTemplate.setCode(code.getBytes());
        landingPageTemplate.setClientId(clientId);
        return landingPageTemplateRepository.save(landingPageTemplate);
    }

    public List<LandingPageTemplate> getAllLandingPageTemplates(Long clientId) {
        // If admin (clientId = 0L), return all templates
        if (clientId == 0L) {
            return landingPageTemplateRepository.findAll();
        }
        // For regular clients, filter by clientId
        return landingPageTemplateRepository.findByClientId(clientId);
    }

    public LandingPageTemplate getLandingPageTemplateById(Long id, Long clientId) {
        LandingPageTemplate template = landingPageTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LandingPageTemplate not found with id: " + id));

        // If admin (clientId = 0L) or matching clientId, return the template
        if (clientId == 0L || template.getClientId().equals(clientId)) {
            return template;
        }
        throw new ResourceNotFoundException("LandingPageTemplate not found with id: " + id + " for this client");
    }

    public LandingPageTemplate updateLandingPageTemplate(Long id, LandingPageTemplate updatedLandingPageTemplate, MultipartFile code, Long clientId) throws IOException {
        LandingPageTemplate landingPageTemplate = getLandingPageTemplateById(id, clientId);
        landingPageTemplate.setName(updatedLandingPageTemplate.getName());
        landingPageTemplate.setCode(code.getBytes());
        return landingPageTemplateRepository.save(landingPageTemplate);
    }

    public void deleteLandingPageTemplate(Long id, Long clientId) {
        LandingPageTemplate template = getLandingPageTemplateById(id, clientId);
        landingPageTemplateRepository.deleteById(id);
    }

    public LandingPageTemplate updateLandingPageTemplateUrl(Long id, String url, Long clientId) {
        LandingPageTemplate landingPageTemplate = getLandingPageTemplateById(id, clientId);

        String modifiedUrl = url + "/api/submit-response";

        String htmlCode = new String(landingPageTemplate.getCode(), java.nio.charset.StandardCharsets.UTF_8);

        String updatedHtmlCode = htmlCode.replace("{{URL}}", modifiedUrl);

        byte[] updatedCodeBytes = updatedHtmlCode.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        landingPageTemplate.setCode(updatedCodeBytes);

        return landingPageTemplateRepository.save(landingPageTemplate);
    }

}
