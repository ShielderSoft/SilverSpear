package com.example.jphish.Repositories;

import com.example.jphish.Models.LandingPageTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LandingPageTemplateRepository extends JpaRepository<LandingPageTemplate, Long> {
    List<LandingPageTemplate> findByClientId(Long clientId); // Added method to find by clientId

}
