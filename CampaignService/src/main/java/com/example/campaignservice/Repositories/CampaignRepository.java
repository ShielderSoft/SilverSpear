package com.example.campaignservice.Repositories;

import com.example.campaignservice.Models.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByClientId(Long clientId);
    List<Campaign> findAll();
    List<Campaign> findByClientIdOrClientId(Long clientId, Long adminId);
}
