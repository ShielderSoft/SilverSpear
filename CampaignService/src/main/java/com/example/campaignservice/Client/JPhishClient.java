package com.example.campaignservice.Client;

import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;


@Component
public class JPhishClient {

    private static final Logger logger = Logger.getLogger(JPhishClient.class.getName());

    @Value("${jphish.base.url}")
    private String jphishBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // New method to validate token and get clientId based on clearance
    public Long validateTokenAndGetClientId(String jwt, String clearance) {
        String url = jphishBaseUrl + "/auth/validateToken";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("clearance", clearance);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("token", jwt);

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return ((Number) response.getBody().get("clientId")).longValue();
            }
            return null;
        } catch (Exception e) {
            logger.severe("Token validation error: " + e.getMessage());
            return null;
        }
    }

    // Maintain backward compatibility
    public boolean validateJwt(String jwt) {
        String url = jphishBaseUrl + "/auth/validate";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("token", jwt);

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            logger.severe("JWT validation error: " + e.getMessage());
            return false;
        }
    }

    // Updated to include authentication headers
    public Map<String, Object> getUserGroupRecipients(Long groupId, String jwt, String clearance) {
        String url = jphishBaseUrl + "/usergroup/" + groupId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwt);
        headers.set("clearance", clearance);

        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Map.class
        );
        return response.getBody();
    }

    // Maintain backward compatibility
    public Map<String, Object> getUserGroupRecipients(Long groupId) {
        logger.warning("Using deprecated method without authentication headers");
        return getUserGroupRecipients(groupId, null, null);
    }

    // Updated with authentication headers
    public Map<String, Object> getResourceDetails(Long resourceId, String jwt, String clearance) {
        String url = jphishBaseUrl + "/resources/" + resourceId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwt);
        headers.set("clearance", clearance);

        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Map.class
        );
        return response.getBody();
    }

    // Maintain backward compatibility
    public Map<String, Object> getResourceDetails(Long resourceId) {
        logger.warning("Using deprecated method without authentication headers");
        return getResourceDetails(resourceId, null, null);
    }

    // Updated with authentication headers
    public Map<String, Object> getSendingProfile(Long profileId, String jwt, String clearance) {
        String url = jphishBaseUrl + "/profile/" + profileId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwt);
        headers.set("clearance", clearance);

        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Map.class
        );
        return response.getBody();
    }

    // Maintain backward compatibility
    public Map<String, Object> getSendingProfile(Long profileId) {
        logger.warning("Using deprecated method without authentication headers");
        return getSendingProfile(profileId, null, null);
    }

    // Updated with authentication headers
    public Map<String, Object> getEmailTemplate(Long emailTemplateId, String jwt, String clearance) {
        try {
            String url = jphishBaseUrl + "/emailTemplate/ID/" + emailTemplateId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwt);
            headers.set("clearance", clearance);

            HttpEntity<?> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    Map.class
            );
            return response.getBody();
        } catch (HttpClientErrorException e) {
            logger.severe("Error fetching email template: " + e.getMessage());
            return null;
        }
    }

    // Maintain backward compatibility
    public Map<String, Object> getEmailTemplate(Long emailTemplateId) {
        logger.warning("Using deprecated method without authentication headers");
        return getEmailTemplate(emailTemplateId, null, null);
    }

    // Updated with authentication headers
    public Map<String, Object> getLandingPageTemplate(Long landingPageTemplateId, String jwt, String clearance) {
        String url = jphishBaseUrl + "/landingPageTemplate/ID/" + landingPageTemplateId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwt);
        headers.set("clearance", clearance);

        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                Map.class
        );
        return response.getBody();
    }

    // Maintain backward compatibility
    public Map<String, Object> getLandingPageTemplate(Long landingPageTemplateId) {
        logger.warning("Using deprecated method without authentication headers");
        return getLandingPageTemplate(landingPageTemplateId, null, null);
    }

    // Updated with authentication headers
    public void updateLandingPageTemplateUrl(Long landingPageTemplateId, String url, String jwt, String clearance) {
        String updateUrl = jphishBaseUrl + "/landingPageTemplate/updateUrl/" + landingPageTemplateId + "?url=" + url;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwt);
        headers.set("clearance", clearance);

        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        restTemplate.exchange(
                updateUrl,
                HttpMethod.PUT,
                requestEntity,
                Void.class
        );
        logger.info("Updated landing page template URL: " + updateUrl);
    }

    // Maintain backward compatibility
    public void updateLandingPageTemplateUrl(Long landingPageTemplateId, String url) {
        logger.warning("Using deprecated method without authentication headers");
        updateLandingPageTemplateUrl(landingPageTemplateId, url, null, null);
    }
}