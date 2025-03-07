//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.JavaMailSenderImpl;
//import org.springframework.mail.javamail.MimeMessageHelper;
//
////import javax.mail.internet.MimeMessage;
//import jakarta.mail.internet.MimeMessage;
//
//import java.util.Properties;
//
//public class SMTPTest {
//
//    public static void main(String[] args) {
//        JavaMailSender mailSender = getMailSender("smtp.gmail.com", 587, "educationforyou2025@gmail.com", "fkbzrebpoeimbdmr");
//
//        try {
//            MimeMessage message = mailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message, true);
//
//            helper.setFrom("educationforyou2025@gmail.com");
//            helper.setTo("sarthakdeb97@gmail.com");
//            helper.setSubject("Test Email");
//            helper.setText("<h1>This is a test email.</h1>", true);
//
//            mailSender.send(message);
//            System.out.println("Email sent successfully!");
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
//
//    private static JavaMailSender getMailSender(String host, int port, String username, String password) {
//        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
//        mailSender.setHost(host);
//        mailSender.setPort(port);
//
//        mailSender.setUsername(username);
//        mailSender.setPassword(password);
//
//        Properties props = mailSender.getJavaMailProperties();
//        props.put("mail.smtp.auth", "true");
//        props.put("mail.smtp.starttls.enable", "true");
//        props.put("mail.transport.protocol", "smtp");
//        props.put("mail.smtp.ssl.trust", host);
//        props.put("mail.debug", "true"); // Enables detailed SMTP logs
//
//        return mailSender;
//    }
//}