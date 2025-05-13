package com.example.jphish.Models;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Client extends BaseModel {
    private String clientName;
    private String clientPassword;
    private String clientEmail;
    private String clientPhone;
    private String clientCompany;
}
