package com.example.jphish.Models;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class SendingProfile  extends BaseModel{
    private String profileName;
    private String profileEmailId;
    private String profileSMTPHost;
    private String profileSMTPPort;
    private String profileSMTPUsername;
    private String profileSMTPPassword;
    private String profileDesc;
    private String domainTld;
    private Long clientId;
}
