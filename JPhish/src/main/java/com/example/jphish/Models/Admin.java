package com.example.jphish.Models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "sender_admin")
@Getter
@Setter
public class Admin extends BaseModel {
    private String username;
    private String password;
    private String email;
}
