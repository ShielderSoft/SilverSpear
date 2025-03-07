package com.example.campaignservice.Client;

import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;


@Component
public class JPhishClient {

    private static final Logger logger = Logger.getLogger(JPhishClient.class.getName());


    @Value("${jphish.base.url}")
    private String jphishBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean validateJwt(String jwt) {
        String url = jphishBaseUrl + "/auth/validate";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);

        HttpEntity<String> requestEntity = new HttpEntity<>(jwt, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            return response.getStatusCode() == HttpStatus.OK;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

    }
    public Map<String, Object> getUserGroupRecipients(Long groupId) {
        String url = jphishBaseUrl + "/usergroup/" + groupId;

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        return response.getBody();
    }
    public Map<String, Object> getResourceDetails(Long resourceId) {
        String url = jphishBaseUrl + "/resources/" + resourceId;
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        return (Map<String, Object>) response.getBody();
    }

    public Map<String, Object> getSendingProfile(Long profileId) {
        String url = jphishBaseUrl + "/profile/" + profileId;
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        return (Map<String, Object>) response.getBody();
    }
    public Map<String, Object> getEmailTemplate(Long emailTemplateId) {
        try {
            String url = jphishBaseUrl + "/emailTemplate/ID/" + emailTemplateId;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return (Map<String, Object>) response.getBody();
        } catch (HttpClientErrorException e) {
            logger.severe("Error fetching email template: " + e.getMessage());
            return null;
        }
    }
    public Map<String, Object> getLandingPageTemplate(Long landingPageTemplateId) {
        String url = jphishBaseUrl + "/landingPageTemplate/ID/" + landingPageTemplateId;
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        return (Map<String, Object>) response.getBody();
    }

}
