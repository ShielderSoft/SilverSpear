package com.example.campaignservice.Models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "campaign_targets")
@JsonIgnoreProperties({"targets"})
public class CampaignTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique link to be sent to each recipient.
    private String uniqueLink;

    private String emailStatus; // e.g., PENDING, SENT, FAILED

    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    // Storing the essential user details locally if needed.
    private Long userId;
    private String userEmail;
    private Boolean emailOpened = false;
}
