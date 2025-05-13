package com.example.campaignservice.Controllers;

import com.example.campaignservice.Client.JPhishClient;
import com.example.campaignservice.Models.Campaign;
import com.example.campaignservice.Models.CampaignTarget;
import com.example.campaignservice.Repositories.CampaignRepository;
import com.example.campaignservice.Repositories.CampaignTargetRepository;
import com.example.campaignservice.Services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.jsoup.Jsoup; // Keep if still needed, though not directly used in provided snippet for HTML processing after decode

import jakarta.mail.MessagingException;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "${app.cors.origin}")
public class CampaignController {

    private static final Logger logger = Logger.getLogger(CampaignController.class.getName());

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private CampaignTargetRepository campaignTargetRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JPhishClient jPhishClient;

    @Value("${landing.page.url:}")
    private String landingPageUrl;

    private String decodeHtmlEntities(String input) {
        // Basic decoding, Jsoup.parse(input).text() might be more robust for full HTML decoding
        return input.replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&amp;", "&")
                .replace("&quot;", "\"")
                .replace("&nbsp;", " ");
    }

    // Helper method to get ClientId using JWT and Clearance header
    private Long getAuthenticatedClientId(String authHeader, String clearanceHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ") || clearanceHeader == null || clearanceHeader.isEmpty()) {
            logger.warning("Authorization header or clearance header is missing or malformed.");
            return null;
        }
        String jwt = authHeader.substring(7); // "Bearer ".length()
        try {
            // JPhishClient now handles validation based on JWT and clearance
            return jPhishClient.validateTokenAndGetClientId(jwt, clearanceHeader);
        } catch (Exception e) {
            logger.severe("Token validation failed via JPhishClient: " + e.getMessage());
            return null;
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllCampaigns(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "clearance", required = false) String clearanceHeader) {
        try {
            Long clientId = getAuthenticatedClientId(authHeader, clearanceHeader);

            if (clientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or missing authorization token/clearance header.");
            }

            // If clientId is 0L (Admin), this will fetch campaigns associated with admin (clientId 0L).
            // If Admin needs to see all campaigns from all clients, this logic and repository method would need to change.
            // Based on current understanding, 0L is treated as a specific clientID for admin.
            List<Campaign> campaigns;
            if (clientId != null && clientId.equals(0L)) { // Check if Admin (clientId 0L)
                logger.info("Admin access: Fetching all campaigns from all clients.");
                campaigns = campaignRepository.findAll(); // You'll need a findAll() method in CampaignRepository
            } else if (clientId != null) {
                campaigns = campaignRepository.findByClientId(clientId);
            } else {
                // This case should ideally be caught by the clientId == null check above it,
                // which returns UNAUTHORIZED. But as a fallback for campaigns list:
                campaigns = Collections.emptyList();
            }
            return ResponseEntity.ok(campaigns);
        } catch (Exception e) {
            logger.severe("Error fetching campaigns: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching campaigns: " + e.getMessage());
        }
    }

    @GetMapping("/tracker/{targetId}")
    public ResponseEntity<byte[]> trackEmailOpen(@PathVariable Long targetId) {
        try {
            logger.info("Email opened tracking request for target ID: " + targetId);
            Optional<CampaignTarget> targetOptional = campaignTargetRepository.findById(targetId);
            if (targetOptional.isPresent()) {
                CampaignTarget target = targetOptional.get();
                target.setEmailOpened(true);
                campaignTargetRepository.save(target);
                logger.info("Updated email opened status for target ID: " + targetId);
            }
            byte[] imageBytes = Base64.getDecoder().decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_GIF)
                    .body(imageBytes);
        } catch (Exception ex) {
            logger.severe("Error tracking email open: " + ex.getMessage());
            byte[] imageBytes = Base64.getDecoder().decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_GIF)
                    .body(imageBytes);
        }
    }

    @PostMapping("/create_and_send")
    public ResponseEntity<?> sendMailWithDomain(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestHeader(value = "clearance", required = true) String clearanceHeader,
            @RequestBody Map<String, Object> requestData) {
        try {
            Long clientId = getAuthenticatedClientId(authHeader, clearanceHeader);
            if (clientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User is Invalid or token/clearance is missing/incorrect!");
            }
            String jwt = authHeader.substring(7);

            Long userGroupId = (Long) ((Number) requestData.get("userGroupId")).longValue();
            Map<String, Object> groupData = jPhishClient.getUserGroupRecipients(userGroupId, jwt, clearanceHeader);
            if (groupData == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User group not found.");
            }

            Long groupClientId = ((Number) groupData.getOrDefault("clientId", -1L)).longValue(); // Use a default not equal to 0L or other valid IDs
            if (clientId != 0L && !clientId.equals(groupClientId)) { // Admin (0L) can access any group, or groups specifically for admin
                // If Admin (0L) should only access groups with clientId 0L, then the condition is just: !clientId.equals(groupClientId)
                // Assuming Admin (0L) might need broader access, or this check applies if not Admin.
                // For strict multi-tenancy including admin: if (!clientId.equals(groupClientId))
                // Let's stick to strict for now as it's safer:
                if (!clientId.equals(groupClientId) && !(clientId.equals(0L) && groupData.get("clientId") == null) /* Allow admin to use global templates without clientID */ ) {
                    // This part needs careful thought based on how admin access to other client resources is defined.
                    // A simpler strict rule:
                    if (!clientId.equals(groupClientId)) {
                        // If Admin (0L) is meant to manage specific admin resources (clientId=0L), this is correct.
                        // If Admin (0L) can manage ANY client's resources, this check needs: if (clientId != 0L && !clientId.equals(groupClientId))
                        // Sticking to the direct interpretation: Admin 0L manages 0L resources.
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("You don't have access to this user group");
                    }
                }
            }


            Long emailTemplateId = (Long) ((Number) requestData.get("emailTemplateId")).longValue();
            Map<String, Object> emailTemplateDetails = jPhishClient.getEmailTemplate(emailTemplateId, jwt, clearanceHeader);
            if (emailTemplateDetails == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Email template not found.");
            }
            // Add similar clientID check for emailTemplateDetails if it has a clientId field and needs to be enforced.

            Long landingPageTemplateId = (Long) ((Number) requestData.get("landingPageTemplateId")).longValue();
            Map<String, Object> landingPageTemplateDetails = jPhishClient.getLandingPageTemplate(landingPageTemplateId, jwt, clearanceHeader);
            if (landingPageTemplateDetails == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Landing page template not found.");
            }
            // Add similar clientID check for landingPageTemplateDetails

            Long profileId = (Long) ((Number) requestData.get("profileId")).longValue();
            Map<String, Object> profileData = jPhishClient.getSendingProfile(profileId, jwt, clearanceHeader);
            if (profileData == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Sending profile not found.");
            }
            // Add similar clientID check for profileData

            if (profileData.get("domainTld") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Sending profile is missing domainTld.");
            }

            String profileDomainTld = profileData.get("domainTld").toString();
            // Assuming jPhishClient.updateLandingPageTemplateUrl also respects clearance for authorization
            jPhishClient.updateLandingPageTemplateUrl(landingPageTemplateId, profileDomainTld, jwt, clearanceHeader);

            List<Map<String, Object>> users = (List<Map<String, Object>>) groupData.get("users");
            if (users == null || users.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No users found in the user group.");
            }

            List<String> recipientEmails = users.stream()
                    .map(user -> user.get("email").toString())
                    .collect(Collectors.toList());

            Campaign campaign = new Campaign();
            String campaignName = requestData.get("campaignName").toString();
            campaign.setName(campaignName);
            campaign.setLandingPageLink(profileData.get("domainTld").toString());
            campaign.setRecipientEmails(recipientEmails);
            campaign.setClientId(clientId); // Set the authenticated client ID (0L for Admin)
            campaign.setStatus("ACTIVE");

            campaignRepository.save(campaign);

            String domainTld = profileData.get("domainTld").toString();

            List<CampaignTarget> targets = users.stream().map(user -> {
                CampaignTarget target = new CampaignTarget();
                target.setCampaign(campaign);
                Long userId = (Long) ((Number) user.get("id")).longValue();
                String userEmail = user.get("email").toString();
                target.setUserId(userId);
                target.setUserEmail(userEmail);
                // Ensure domainTld includes scheme if needed, e.g., http:// or https://
                String uniqueLink = String.format("%s/%d/%d/%d",
                        domainTld.startsWith("http") ? domainTld : "http://" + domainTld, // Basic scheme check
                        campaign.getId(),
                        userId,
                        landingPageTemplateId);
                System.out.println("Unique link: " + uniqueLink);
                target.setUniqueLink(uniqueLink);
                target.setEmailStatus("PENDING");
                return target;
            }).collect(Collectors.toList());
            campaignTargetRepository.saveAll(targets);
            campaign.setTargets(targets); // In-memory association, campaign is already saved.

            String base64Body = emailTemplateDetails.get("body").toString();
            byte[] bodyBytes = Base64.getDecoder().decode(base64Body);
            String htmlContent = new String(bodyBytes, StandardCharsets.UTF_8);
            htmlContent = decodeHtmlEntities(htmlContent); // Decode HTML entities from template

            String profileEmailId = profileData.get("profileEmailId").toString();
            String smtpHost = (String) profileData.get("profileSMTPHost");
            String smtpPortStr = (String) profileData.get("profileSMTPPort");
            String smtpUsername = (String) profileData.get("profileSMTPUsername");
            String smtpPassword = (String) profileData.get("profileSMTPPassword");

            int smtpPort;
            try {
                smtpPort = Integer.parseInt(smtpPortStr);
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid SMTP port number.");
            }

            var dynamicMailSender = emailService.getDynamicMailSender(smtpHost, smtpPort, smtpUsername, smtpPassword, profileEmailId);

            for (CampaignTarget target : targets) {
                String trackerPixelHost = System.getenv("TRACKER_PIXEL_HOST"); // e.g., http://localhost:8001 or your service URL
                if (trackerPixelHost == null || trackerPixelHost.isEmpty()) {
                    trackerPixelHost = domainTld.contains(":") ? domainTld.replaceAll(":\\d+", ":8000") : domainTld + ":8000";
                    // Fallback, ideally configure this externally. 8000 is current service port from campaign-service.
                }

                String trackerUrl = trackerPixelHost + "/api/campaigns/tracker/" + target.getId();

                String personalizedHtml = htmlContent.replace("{{.FirstName}}", "User") // Replace with actual name if available
                        .replace("{{.URL}}", target.getUniqueLink())
                        .replace("{{.TrackerURL}}", "<img src=\"" + trackerUrl + "\" alt=\"\" width=\"1\" height=\"1\" style=\"display:none;\" />"); // Tracker image

                emailService.sendEmail(dynamicMailSender, target.getUserEmail(),
                        emailTemplateDetails.get("subject").toString(),
                        personalizedHtml);
                target.setEmailStatus("SENT");
                campaignTargetRepository.save(target);
            }

            return ResponseEntity.ok("Campaign created and emails sent successfully!");
        } catch (MessagingException e) {
            logger.severe("MessagingException occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send emails: " + e.getMessage());
        } catch (Exception ex) {
            logger.severe("An error occurred while creating the campaign: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while creating the campaign: " + ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestHeader(value = "clearance", required = true) String clearanceHeader) {
        try {
            logger.info("Received request to delete campaign with ID: " + id);
            Long authenticatedClientId = getAuthenticatedClientId(authHeader, clearanceHeader);

            if (authenticatedClientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or missing authorization token/clearance.");
            }

            Optional<Campaign> campaignOptional = campaignRepository.findById(id);
            if (campaignOptional.isEmpty()) {
                logger.warning("Campaign with ID " + id + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Campaign not found with ID: " + id);
            }

            Campaign campaign = campaignOptional.get();
            // Admin (0L) can only delete their own (clientId=0L) campaigns.
            // If Admin (0L) should be able to delete any campaign, this check needs to be:
            // if (authenticatedClientId != 0L && !authenticatedClientId.equals(campaign.getClientId()))
            if (!authenticatedClientId.equals(0L) && !authenticatedClientId.equals(campaign.getClientId())) {
                logger.warning("User with clientId " + authenticatedClientId + " attempted to delete campaign ID " + id + " owned by clientId " + campaign.getClientId() + ". Access denied.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to delete this campaign");
            }

            campaignRepository.deleteById(id);
            logger.info("Campaign with ID " + id + " deleted successfully by clientId: " + authenticatedClientId);
            return ResponseEntity.ok("Campaign deleted successfully");
        } catch (Exception ex) {
            logger.severe("Error deleting campaign: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while deleting the campaign: " + ex.getMessage());
        }
    }

    @PostMapping("/send")
    public ResponseEntity<?> createAndSendCampaign(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestHeader(value = "clearance", required = true) String clearanceHeader,
            @RequestBody Map<String, Object> requestData) {
        try {
            logger.info("Received request to create and send campaign (generic /send).");
            Long clientId = getAuthenticatedClientId(authHeader, clearanceHeader);

            if (clientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User is Invalid or token/clearance is missing/incorrect!");
            }
            String jwt = authHeader.substring(7);

            Long userGroupId = (Long) ((Number) requestData.get("userGroupId")).longValue();
            Map<String, Object> groupData = jPhishClient.getUserGroupRecipients(userGroupId, jwt, clearanceHeader);
            if (groupData == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User group not found.");
            }
            Long groupClientId = ((Number) groupData.getOrDefault("clientId", -1L)).longValue();
            if (!clientId.equals(groupClientId)) { // Strict check: user can only use their own groups
                // If Admin (0L) is an exception, add: && !(clientId == 0L && groupData.get("clientId") == null /* for global ones */)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this user group");
            }

            List<Map<String, Object>> usersList = (List<Map<String, Object>>) groupData.get("users");
            if (usersList == null || usersList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No users found in the group.");
            }
            List<String> recipients = usersList.stream()
                    .map(userObj -> (String) userObj.get("email"))
                    .filter(email -> email != null && !email.trim().isEmpty())
                    .map(String::trim)
                    .collect(Collectors.toList());
            if (recipients.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No valid email addresses found in the user group.");
            }

            Long resourceId = (Long) ((Number) requestData.get("resourceId")).longValue();
            Map<String, Object> resourceDetails = jPhishClient.getResourceDetails(resourceId, jwt, clearanceHeader);
            if (resourceDetails == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resource not found.");
            }
            Long resourceClientId = ((Number) resourceDetails.getOrDefault("clientId", -1L)).longValue();
            if (!clientId.equals(resourceClientId)) { // Strict check
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this resource");
            }

            String emailTemplate = (String) resourceDetails.getOrDefault("emailTemplate", "Default email body");
            String landingpageTemplate = (String) resourceDetails.getOrDefault("landingpageTemplate", landingPageUrl);

            Long profileId = (Long) ((Number) requestData.get("profileId")).longValue();
            Map<String, Object> profileData = jPhishClient.getSendingProfile(profileId, jwt, clearanceHeader);
            if (profileData == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sending profile not found.");
            }
            Long profileClientId = ((Number) profileData.getOrDefault("clientId", -1L)).longValue();
            if (!clientId.equals(profileClientId)) { // Strict check
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this sending profile");
            }

            String profileEmailId = (String) profileData.get("profileEmailId");
            String smtpHost = (String) profileData.get("profileSMTPHost");
            String smtpPortStr = (String) profileData.get("profileSMTPPort");
            String smtpUsername = (String) profileData.get("profileSMTPUsername");
            String smtpPassword = (String) profileData.get("profileSMTPPassword");
            int smtpPort = Integer.parseInt(smtpPortStr);

            Campaign campaign = new Campaign(profileEmailId, emailTemplate, landingpageTemplate, recipients);
            campaign.setClientId(clientId);
            campaign.setStatus("ACTIVE");
            // Consider adding campaign name if available from requestData
            // campaign.setName(requestData.getOrDefault("campaignName", "Generic Campaign").toString());
            campaignRepository.save(campaign);

            String subject = "New Campaign"; // Consider making this configurable
            String htmlBody = "<p>" + emailTemplate + "</p>"
                    + "<p>Click <a href=\"" + landingpageTemplate + "\">here</a> to visit the landing page.</p>";
            // This HTML body might need to incorporate unique links and trackers like in /create_and_send

            var dynamicMailSender = emailService.getDynamicMailSender(smtpHost, smtpPort, smtpUsername, smtpPassword, profileEmailId);
            emailService.sendEmailToMultipleRecipients(dynamicMailSender, profileEmailId, recipients, subject, htmlBody);

            return ResponseEntity.ok("Campaign created and emails sent successfully!");
        } catch (MessagingException e) {
            logger.severe("MessagingException in /send: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send emails: " + e.getMessage());
        } catch (Exception ex) {
            logger.severe("Error in /send: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + ex.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateCampaignStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestHeader(value = "clearance", required = true) String clearanceHeader) {
        try {
            Long authenticatedClientId = getAuthenticatedClientId(authHeader, clearanceHeader);
            if (authenticatedClientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing authorization token/clearance.");
            }

            Optional<Campaign> campaignOptional = campaignRepository.findById(id);
            if (campaignOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Campaign not found with ID: " + id);
            }

            Campaign campaign = campaignOptional.get();
            if (!authenticatedClientId.equals(campaign.getClientId())) {
                // Admin (0L) can only update their own (clientId=0L) campaigns.
                // If Admin (0L) should be able to update any campaign, change to:
                // if (authenticatedClientId != 0L && !authenticatedClientId.equals(campaign.getClientId()))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to update this campaign");
            }

            campaign.setStatus(status);
            campaignRepository.save(campaign);
            return ResponseEntity.ok("Campaign status updated successfully");
        } catch (Exception ex) {
            logger.severe("Error updating campaign status: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while updating campaign status: " + ex.getMessage());
        }
    }

    @GetMapping("/{campaignId}/targets")
    public ResponseEntity<?> getCampaignTargets(
            @PathVariable Long campaignId,
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestHeader(value = "clearance", required = true) String clearanceHeader) {
        try {
            Long authenticatedClientId = getAuthenticatedClientId(authHeader, clearanceHeader);
            if (authenticatedClientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing authorization token/clearance.");
            }

            Optional<Campaign> campaignOptional = campaignRepository.findById(campaignId);
            if (campaignOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Campaign not found with ID: " + campaignId);
            }

            Campaign campaign = campaignOptional.get();
            if (!authenticatedClientId.equals(0L) && !authenticatedClientId.equals(campaign.getClientId())) {
                logger.warning("User with clientId " + authenticatedClientId + " attempted to get targets for campaign ID " + campaignId + " owned by clientId " + campaign.getClientId() + ". Access denied.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to view this campaign's targets");
            }

            List<CampaignTarget> targets = campaignTargetRepository.findByCampaignId(campaignId);
            return ResponseEntity.ok(targets.isEmpty() ? Collections.emptyList() : targets);
        } catch (Exception ex) {
            logger.severe("Error fetching campaign targets: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching campaign targets: " + ex.getMessage());
        }
    }

    @GetMapping("/client/{clientIdFromPath}") // Renamed path variable for clarity
    public ResponseEntity<?> getCampaignsByClient(
            @PathVariable Long clientIdFromPath,
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestHeader(value = "clearance", required = true) String clearanceHeader) {
        try {
            Long authenticatedClientId = getAuthenticatedClientId(authHeader, clearanceHeader);
            if (authenticatedClientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing authorization token/clearance.");
            }

            // An authenticated client can only request their own campaigns using this endpoint.
            // If authenticatedClientId is Admin (0L), they can only request clientIdFromPath=0L.
            // This endpoint is not for Admin to view other clients' campaigns by path.
            // Admin should use /api/campaigns/all (which fetches for clientId=0L) or a different mechanism if they need to see all.
            if (!authenticatedClientId.equals(0L) && !authenticatedClientId.equals(clientIdFromPath)) {
                logger.warning("Client user with clientId " + authenticatedClientId + " attempted to access campaigns for clientId " + clientIdFromPath + " via specific client path. Access denied.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to view campaigns for the specified client ID.");
            }

            List<Campaign> campaigns = campaignRepository.findByClientId(clientIdFromPath);
            return ResponseEntity.ok(campaigns);
        } catch (Exception ex) {
            logger.severe("Error fetching client campaigns: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching campaigns: " + ex.getMessage());
        }
    }

    @PostMapping("/send/single")
    public ResponseEntity<?> singleCampaign(
            @RequestHeader(value = "Authorization", required = true) String authHeader,
            @RequestHeader(value = "clearance", required = true) String clearanceHeader,
            @RequestBody Map<String, Object> requestData) {
        try {
            Long clientId = getAuthenticatedClientId(authHeader, clearanceHeader);
            if (clientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing authorization token/clearance.");
            }

            String senderEmail = (String) requestData.get("senderEmail");
            String description = (String) requestData.get("description"); // Used as email body content
            String campaignName = (String) requestData.getOrDefault("campaignName", "Single Send Campaign");
            String smtpHost = (String) requestData.get("smtpHost");
            String smtpPortStr = (String) requestData.get("smtpPort");
            String smtpUserName = (String) requestData.get("smtpUserName");
            String smtpPassword = (String) requestData.get("smtpPassword");
            int smtpPort = Integer.parseInt(smtpPortStr);

            @SuppressWarnings("unchecked")
            List<String> recipients = (List<String>) requestData.get("recipientEmails");
            String landingPage = (String) requestData.get("landingPage"); // This is the simple link, not a template ID.

            Campaign campaign = new Campaign();
            campaign.setName(campaignName);
            campaign.setSenderEmail(senderEmail);
            campaign.setDescription(description); // Storing description/email body content
            campaign.setLandingPageLink(landingPage);
            campaign.setRecipientEmails(recipients);
            campaign.setClientId(clientId);
            campaign.setStatus("ACTIVE"); // Or "SENT" immediately if no further tracking/management
            campaignRepository.save(campaign);

            var dynamicMailSender = emailService.getDynamicMailSender(smtpHost, smtpPort, smtpUserName, smtpPassword, senderEmail);
            String subject = (String) requestData.getOrDefault("subject", "Information"); // Allow subject from request

            // For this simple send, unique links & tracking per recipient are not implemented as in /create_and_send
            // The body is the description + landing page link.
            String htmlBody = "<p>" + Jsoup.parse(description).text() + "</p>" // Basic HTML sanitization/conversion
                    + "<p>Click <a href=\"" + landingPage + "\">here</a> for more information.</p>";

            emailService.sendEmailToMultipleRecipients(dynamicMailSender, senderEmail, recipients, subject, htmlBody);

            return ResponseEntity.ok("Campaign created and emails sent successfully!");
        } catch (MessagingException e) {
            logger.severe("MessagingException in /send/single: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send emails: " + e.getMessage());
        } catch (NumberFormatException e) {
            logger.warning("Invalid SMTP port format: " + requestData.get("smtpPort"));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid SMTP port number.");
        }
        catch (Exception ex) {
            logger.severe("Error in /send/single: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while creating the campaign: " + ex.getMessage());
        }
    }
}