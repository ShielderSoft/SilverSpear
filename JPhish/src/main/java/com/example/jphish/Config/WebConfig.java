//package com.example.jphish.Config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class WebConfig implements WebMvcConfigurer {
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**")
//            // Use allowed origin patterns instead of "*" when credentials are enabled.
//            .allowedOriginPatterns("http://147.93.111.204:5173", "http://localhost:5173")
//            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//            .allowedHeaders("*")
//            .allowCredentials(true)
//            .exposedHeaders("Authorization", "Content-Type")
//            // Optional: A max age (in seconds) for how long the response from a pre-flight request can be cached by clients.
//            .maxAge(3600);
//    }
//}
