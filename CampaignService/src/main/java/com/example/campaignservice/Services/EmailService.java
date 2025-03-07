package com.example.campaignservice.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Properties;
import java.util.logging.Logger;

@Service
public class EmailService {

    private static final Logger logger = Logger.getLogger(EmailService.class.getName());

    public JavaMailSender getDynamicMailSender(String host,
                                               Integer port,
                                               String username,
                                               String password,
                                               String envelopeFrom) {
        JavaMailSenderImpl mailSenderImpl = new JavaMailSenderImpl();
        mailSenderImpl.setHost(host);

        if (port != null) {
            mailSenderImpl.setPort(port);
        }

        mailSenderImpl.setUsername(username);
        mailSenderImpl.setPassword(password);

        Properties props = mailSenderImpl.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");

        if (port == 587) { // STARTTLS
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.ssl.enable", "false");
        } else if (port == 465) { // SSL
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.starttls.enable", "false");
        } else { // Default or other ports
            props.put("mail.smtp.starttls.enable", "true"); // Safe default
            props.put("mail.smtp.ssl.enable", "false");
        }
        if (envelopeFrom != null && !envelopeFrom.isEmpty()) {
            props.put("mail.smtp.from", envelopeFrom);
        }
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.debug", "true");

        logger.info("JavaMailSender configured with host: " + host + ", port: " + port);

        return mailSenderImpl;
    }
    public void sendEmail(JavaMailSender mailSender, String to, String subject, String content) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        mailSender.send(message);
    }

    public void sendEmailToMultipleRecipients(
            JavaMailSender mailSender,
            String from,
            List<String> recipients,
            String subject,
            String htmlBody
    ) throws MessagingException {
        if (recipients == null || recipients.isEmpty()) {
            logger.warning("No recipients provided. Skipping email sending.");
            return;
        }

        logger.info("Starting to send emails to " + recipients.size() + " recipients.");

        for (String to : recipients) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);

                helper.setFrom(from);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlBody, true);

                mailSender.send(message);
                logger.info("Email sent successfully to: " + to);
            }catch (MessagingException e) {
                logger.severe("Failed to send email to: " + to + " | Error: " + e.getMessage());
                // Optionally, you can choose to continue sending to other recipients or halt
                throw e; // Rethrow to handle it in the controller
            }
        }
//        logger.info("All emails have been processed.");
    }

//    private JavaMailSender mailSender;

//    public void sendEmailToMultipleRecipients(
//            String from,
//            List<String> recipients,
//            String subject,
//            String htmlBody
//    ) throws MessagingException {
//        for (String to : recipients) {
//            MimeMessage message = mailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message, true);
//
//            helper.setTo(to);
//            helper.setFrom(from);
//            helper.setSubject(subject);
//            helper.setText(htmlBody, true);
//
//            mailSender.send(message);
//        }
//    }
}
