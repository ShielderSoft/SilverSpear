package com.example.jphish.Repositories;

import com.example.jphish.Models.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByClientEmail(String clientEmail);
    boolean existsByClientEmail(String clientEmail);
}

