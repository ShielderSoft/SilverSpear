package com.example.campaignservice.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.campaignservice.Models.CampaignTarget;


public interface CampaignTargetRepository extends JpaRepository<CampaignTarget, Long> {
}
