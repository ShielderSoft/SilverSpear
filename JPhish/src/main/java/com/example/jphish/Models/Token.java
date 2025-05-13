package com.example.jphish.Models;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Token extends BaseModel {
    private String token;
    private Date expiryDate;
    private boolean revoked;

    @ManyToOne
    private Client client;
}