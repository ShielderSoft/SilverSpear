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
import org.jsoup.Jsoup;

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
        return input.replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&amp;", "&")
                .replace("&quot;", "\"")
                .replace("&nbsp;", " ");
    }

    @GetMapping("/all")
    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    @GetMapping("/tracker/{targetId}")
    public ResponseEntity<byte[]> trackEmailOpen(@PathVariable Long targetId) {
        try {
            logger.info("Email opened tracking request for target ID: " + targetId);

            // Find the target and update its status
            Optional<CampaignTarget> targetOptional = campaignTargetRepository.findById(targetId);
            if (targetOptional.isPresent()) {
                CampaignTarget target = targetOptional.get();
                target.setEmailOpened(true);
                campaignTargetRepository.save(target);
                logger.info("Updated email opened status for target ID: " + targetId);
            }

            // Return a transparent 1x1 pixel GIF
            byte[] imageBytes = Base64.getDecoder().decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_GIF)
                    .body(imageBytes);
        } catch (Exception ex) {
            logger.severe("Error tracking email open: " + ex.getMessage());
            // Still return an image to avoid errors on the client side
            byte[] imageBytes = Base64.getDecoder().decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_GIF)
                    .body(imageBytes);
        }
    }

    @PostMapping("/create_and_send")
    public String sendMailWithDomain(@RequestBody Map<String, Object> requestData) {
        try {
            String jwt = (String) requestData.get("jwtToken");
            if (jwt == null || !jPhishClient.validateJwt(jwt)) {
                return "User is Invalid!";
            }
            Long userGroupId = (Long) ((Number) requestData.get("userGroupId")).longValue();
            Map<String, Object> groupData = jPhishClient.getUserGroupRecipients(userGroupId);
            if (groupData == null) {
                return "User group not found.";
            }
            Long emailTemplateId = (Long) ((Number) requestData.get("emailTemplateId")).longValue();
            Map<String, Object> emailTemplateDetails = jPhishClient.getEmailTemplate(emailTemplateId);
            if (emailTemplateDetails == null) {
                return "email not found.";
            }
            Long landingPageTemplateId = (Long) ((Number) requestData.get("landingPageTemplateId")).longValue();
            Map<String, Object> landingPageTemplateDetails = jPhishClient.getLandingPageTemplate(landingPageTemplateId);
            if (landingPageTemplateDetails == null) {
                return "page not found.";
            }
            Long profileId = (Long) ((Number) requestData.get("profileId")).longValue();
            Map<String, Object> profileData = jPhishClient.getSendingProfile(profileId);
            if (profileData == null) {
                return "Sending profile not found.";
            }

            if (profileData.get("domainTld") == null) {
                return "Sending profile is missing domainTld.";
            }

            // Add this code after fetching the landing page template details and before the targets creation
            String profileDomainTld = profileData.get("domainTld").toString();
            jPhishClient.updateLandingPageTemplateUrl(landingPageTemplateId, profileDomainTld);

            List<Map<String, Object>> users = (List<Map<String, Object>>) groupData.get("users");
            if (users == null || users.isEmpty()) {
                return "No users found in the user group.";
            }

            List<String> recipientEmails = users.stream()
                    .map(user -> user.get("email").toString())
                    .collect(Collectors.toList());

            Campaign campaign = new Campaign();
            String campaignName = requestData.get("campaignName").toString();
            campaign.setName(campaignName);
            campaign.setLandingPageLink(profileData.get("domainTld").toString());
            campaign.setRecipientEmails(recipientEmails);

            campaignRepository.save(campaign);

            String domainTld = profileData.get("domainTld").toString();

            List<CampaignTarget> targets = users.stream().map(user -> {
                CampaignTarget target = new CampaignTarget();
                target.setCampaign(campaign);
                Long userId = (Long) ((Number) user.get("id")).longValue();
                String userEmail = user.get("email").toString();
                target.setUserId(userId);
                target.setUserEmail(userEmail);
                String uniqueLink = String.format("%s/%d/%d/%d",
                        domainTld,
                        campaign.getId(),
                        userId,
                        landingPageTemplateId);
                System.out.println("Unique link: " + uniqueLink);
                target.setUniqueLink(uniqueLink);
                target.setEmailStatus("PENDING");
                return target;
            }).collect(Collectors.toList());
            campaignTargetRepository.saveAll(targets);
            campaign.setTargets(targets);

            String base64Body = emailTemplateDetails.get("body").toString();
            byte[] bodyBytes = Base64.getDecoder().decode(base64Body);
            String htmlContent = new String(bodyBytes, StandardCharsets.UTF_8);
//            String plainTextBody = Jsoup.parse(htmlContent).text();
            htmlContent = decodeHtmlEntities(htmlContent);


            String profileEmailId = profileData.get("profileEmailId").toString();
            String smtpHost = (String) profileData.get("profileSMTPHost");
            String smtpPortStr = (String) profileData.get("profileSMTPPort");
            String smtpUsername = (String) profileData.get("profileSMTPUsername");
            String smtpPassword = (String) profileData.get("profileSMTPPassword");

            int smtpPort;
            try {
                smtpPort = Integer.parseInt(smtpPortStr);
            } catch (NumberFormatException e) {
                return "Invalid SMTP port number.";
            }

            var dynamicMailSender = emailService.getDynamicMailSender(smtpHost, Integer.valueOf(smtpPort), smtpUsername, smtpPassword, profileEmailId);

            int successCount = 0;
            int failCount = 0;
            List<String> failedEmails = new ArrayList<>();

            for (CampaignTarget target : targets) {
                String trackerUrl;
                if (domainTld.contains(":")) {
                    trackerUrl = domainTld.replaceAll(":\\d+", ":8000") + "/api/campaigns/tracker/" + target.getId();
                } else {
                    trackerUrl = domainTld + ":8000/api/campaigns/tracker/" + target.getId();
                }
                String personalizedHtml = htmlContent.replace("{{.FirstName}}", "User")  // Replace with actual name if available
                        .replace("{{.URL}}", target.getUniqueLink())
                        .replace("{{.TrackerURL}}", "<img src=\"" + trackerUrl + "\" alt=\"\" width=\"1\" height=\"1\" />"); // Tracker image
                emailService.sendEmail(dynamicMailSender, target.getUserEmail(),
                        emailTemplateDetails.get("subject").toString(),
                        personalizedHtml);
                target.setEmailStatus("SENT");
                campaignTargetRepository.save(target);
                successCount++;
            }

            return "Campaign created and emails sent successfully!";
        } catch (MessagingException e) {
            logger.severe("MessagingException occurred: " + e.getMessage());
            e.printStackTrace();
            return "Failed to send emails.";
        } catch (Exception ex) {
            ex.printStackTrace();
            return "An error occurred while creating the campaign.";
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(@PathVariable Long id) {
        try {
            logger.info("Received request to delete campaign with ID: " + id);

            // Check if campaign exists
            Optional<Campaign> campaignOptional = campaignRepository.findById(id);
            if (campaignOptional.isEmpty()) {
                logger.warning("Campaign with ID " + id + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Campaign not found with ID: " + id);
            }

            // Delete the campaign
            campaignRepository.deleteById(id);
            logger.info("Campaign with ID " + id + " deleted successfully");

            return ResponseEntity.ok("Campaign deleted successfully");
        } catch (Exception ex) {
            logger.severe("Error deleting campaign: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while deleting the campaign: " + ex.getMessage());
        }
    }


    @PostMapping("/send")
    public String createAndSendCampaign(@RequestBody Map<String, Object> requestData) {
        try {
            logger.info("Received request to create and send campaign.");

            String jwt = (String) requestData.get("jwtToken");
            if (!jPhishClient.validateJwt(jwt)) {
                logger.warning("JWT validation failed.");
                return "User is Invalid!";
            }

            Long userGroupId = (Long) ((Number) requestData.get("userGroupId")).longValue();
            logger.info("Fetching user group with ID: " + userGroupId);
            Map<String, Object> groupData = jPhishClient.getUserGroupRecipients(userGroupId);
            if (groupData == null) {
                logger.warning("User group not found for ID: " + userGroupId);
                return "User group not found.";
            }
            String groupName = (String) groupData.get("groupName");
            logger.info("User group name: " + groupName);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> usersList = (List<Map<String, Object>>) groupData.get("users");
            if (usersList == null || usersList.isEmpty()) {
                logger.warning("No users found in the group with ID: " + userGroupId);
                return "No users found in the group.";
            }
            List<String> recipients = new ArrayList<>();
            for (Map<String, Object> userObj : usersList) {
                Object emailObj = userObj.get("email");
                String email =  null;
                if (emailObj instanceof String) {
                    email = ((String) emailObj).trim();
                }
                logger.info("Extracted email for user ID " + userObj.get("id") + ": " + email);

                if (email != null && !email.isEmpty()) {
                    recipients.add(email);
                    logger.info("Added recipient: " + email);
                }
                else {
                    logger.warning("User with ID " + userObj.get("id") + " has no valid email.");
                }
            }
            if (recipients.isEmpty()) {
                logger.warning("No valid email addresses found in the user group.");
                return "No valid email addresses found in the user group.";
            }

            Long resourceId = (Long) ((Number) requestData.get("resourceId")).longValue();
            Map<String, Object> resourceDetails = jPhishClient.getResourceDetails(resourceId);
            if (resourceDetails == null) {
                return "Resource not found.";
            }
            String emailTemplate = (String) resourceDetails.getOrDefault("emailTemplate", "Default email body");
            String landingpageTemplate = (String) resourceDetails.getOrDefault("landingpageTemplate", landingPageUrl);

            // 4) Retrieve sending profile details
            Long profileId = (Long) ((Number) requestData.get("profileId")).longValue();
            Map<String, Object> profileData = jPhishClient.getSendingProfile(profileId);
            if (profileData == null) {
                return "Sending profile not found.";
            }
            String profileName = (String) profileData.get("profileName");
            String profileEmailId = (String) profileData.get("profileEmailId");
            String smtpHost = (String) profileData.get("profileSMTPHost");
            String smtpPortStr = (String) profileData.get("profileSMTPPort");
            String smtpUsername = (String) profileData.get("profileSMTPUsername");
            String smtpPassword = (String) profileData.get("profileSMTPPassword");

            int smtpPort;
            try {
                smtpPort = Integer.parseInt(smtpPortStr);
                logger.info("SMTP Port: " + smtpPort);
            } catch (NumberFormatException e) {
                logger.severe("Invalid SMTP port number: " + smtpPortStr);
                return "Invalid SMTP port number.";
            }

            Campaign campaign = new Campaign(profileEmailId, emailTemplate, landingpageTemplate, recipients);
            campaignRepository.save(campaign);
            logger.info("Campaign saved successfully with ID: " + campaign.getId());

            String subject = "New Campaign";
            String htmlBody = "<p>" + emailTemplate + "</p>"
                    + "<p>Click <a href=\"" + landingpageTemplate + "\">here</a> to visit the landing page.</p>";

            logger.info("Creating dynamic JavaMailSender with host: " + smtpHost + ", port: " + smtpPort);
            var dynamicMailSender = emailService.getDynamicMailSender(smtpHost, Integer.valueOf(smtpPort), smtpUsername, smtpPassword, profileEmailId);
            logger.info("Dynamic JavaMailSender created.");

            emailService.sendEmailToMultipleRecipients(
                    dynamicMailSender,
                    profileEmailId,
                    recipients,
                    subject,
                    htmlBody
            );

            logger.info("All emails have been sent.");
            return "Campaign created and emails sent successfully!";
        } catch (MessagingException e) {
            logger.severe("MessagingException occurred: " + e.getMessage());
            e.printStackTrace();
            return "Failed to send emails.";
        } catch (Exception ex) {
            ex.printStackTrace();
            return "An error occurred while creating the campaign.";
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateCampaignStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            logger.info("Received request to update status for campaign with ID: " + id + " to status: " + status);

            // Check if campaign exists
            Optional<Campaign> campaignOptional = campaignRepository.findById(id);
            if (campaignOptional.isEmpty()) {
                logger.warning("Campaign with ID " + id + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Campaign not found with ID: " + id);
            }

            // Update campaign status
            Campaign campaign = campaignOptional.get();
            campaign.setStatus(status);
            campaignRepository.save(campaign);

            logger.info("Campaign with ID " + id + " status updated to: " + status);

            return ResponseEntity.ok("Campaign status updated successfully");
        } catch (Exception ex) {
            logger.severe("Error updating campaign status: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating the campaign status: " + ex.getMessage());
        }
    }

    @GetMapping("/{campaignId}/targets")
    public ResponseEntity<?> getCampaignTargets(@PathVariable Long campaignId) {
        try {
            logger.info("Fetching targets for campaign with ID: " + campaignId);

            // Check if campaign exists
            Optional<Campaign> campaignOptional = campaignRepository.findById(campaignId);
            if (campaignOptional.isEmpty()) {
                logger.warning("Campaign with ID " + campaignId + " not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Campaign not found with ID: " + campaignId);
            }

            // Get targets for the campaign
            List<CampaignTarget> targets = campaignTargetRepository.findByCampaignId(campaignId);

            // If no targets found, return empty list
            if (targets.isEmpty()) {
                logger.info("No targets found for campaign with ID: " + campaignId);
                return ResponseEntity.ok(Collections.emptyList());
            }

            logger.info("Found " + targets.size() + " targets for campaign with ID: " + campaignId);
            return ResponseEntity.ok(targets);
        } catch (Exception ex) {
            logger.severe("Error fetching campaign targets: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching the campaign targets: " + ex.getMessage());
        }
    }

    @PostMapping("/send/single")
    public String singleCampaign(@RequestBody Map<String, Object> requestData) {
        try {
            String senderEmail = (String) requestData.get("senderEmail");
            String description = (String) requestData.get("description");
            String smtpHost = (String) requestData.get("smtpHost");
            String smtpPortStr = (String) requestData.get("smtpPort");
            String smtpUserName = (String) requestData.get("smtpUserName");
            String smtpPassword = (String) requestData.get("smtpPassword");

           int smtpPort;
           try {
                    smtpPort = Integer.parseInt(smtpPortStr);
                } catch (NumberFormatException e) {
                    return "Invalid SMTP port number.";
                }

            List<String> recipients = (List<String>) requestData.get("recipientEmails");
            String landingPage = (String) requestData.get("landingPage");

            Campaign campaign = new Campaign();
            campaign.setSenderEmail(senderEmail);
            campaign.setDescription(description);
            campaign.setLandingPageLink(landingPage);
            campaign.setRecipientEmails(recipients);

            campaignRepository.save(campaign);
              var dynamicMailSender = emailService.getDynamicMailSender(smtpHost, Integer.valueOf(smtpPort), smtpUserName, smtpPassword, senderEmail);


            String subject = "New Campaign";
            String htmlBody = "<p>" + description + "</p>"
                    + "<p>Click <a href=\"" + landingPage + "\">here</a> to visit the landing page.</p>";

            emailService.sendEmailToMultipleRecipients(
                    dynamicMailSender,
                    senderEmail,
                    recipients,
                    subject,
                    htmlBody
            );

            return "Campaign created and emails sent successfully!";
        } catch (MessagingException e) {
            e.printStackTrace();
            return "Failed to send emails.";
        } catch (Exception ex) {
            ex.printStackTrace();
            return "An error occurred while creating the campaign.";
        }
    }
}
