package com.example.jphish.Repositories;

import com.example.jphish.Models.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    List<EmailTemplate> findByClientId(Long clientId);
}
