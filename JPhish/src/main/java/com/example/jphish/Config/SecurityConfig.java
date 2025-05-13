package com.example.jphish.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOriginsStr;

    @Value("${cors.allowed-methods}")
    private String allowedMethodsStr;

    @Value("${cors.allowed-headers}")
    private String allowedHeadersStr;

    @Value("${cors.max-age}")
    private Long maxAge;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http

                .csrf().disable()
                .cors()
                .and()
                .authorizeHttpRequests(authorize -> authorize
                        // Permit OPTIONS requests for preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/**").permitAll()
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration config = new CorsConfiguration();

        System.out.println("Configuring CORS...");

        List<String> allowedOrigins = Arrays.asList(allowedOriginsStr.split(","));
        config.setAllowedOriginPatterns(allowedOrigins);

        List<String> allowedMethods = Arrays.asList(allowedMethodsStr.split(","));
        config.setAllowedMethods(allowedMethods);

        List<String> allowedHeaders = Arrays.asList(allowedHeadersStr.split(","));
        config.setAllowedHeaders(allowedHeaders);

        config.setAllowCredentials(true);
        config.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));

        // Set max age to 1 hour
        config.setMaxAge(maxAge);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
