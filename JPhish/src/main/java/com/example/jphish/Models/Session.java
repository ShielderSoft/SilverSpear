package com.example.jphish.Models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="working_session")
@Getter
@Setter
public class Session extends BaseModel {
    private String username;
    private String token;
}
