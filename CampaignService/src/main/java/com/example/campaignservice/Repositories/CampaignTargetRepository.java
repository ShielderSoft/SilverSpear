package com.example.campaignservice.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.campaignservice.Models.CampaignTarget;

import java.util.List;


public interface CampaignTargetRepository extends JpaRepository<CampaignTarget, Long> {
    List<CampaignTarget> findByCampaignId(Long campaignId);
}
