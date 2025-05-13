package com.example.campaignservice.Models;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//import javax.persistence.*;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"targets"})
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String senderEmail;
    private String description;
    private String landingPageLink;
    private String status;
    private Long clientId;

    @ElementCollection
    private List<String> phisedUsers;

    @ElementCollection
    private List<String> recipientEmails;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CampaignTarget> targets;

    public Campaign(String senderEmail, String description, String landingPageL, List<String> recipients) {
    }
}
