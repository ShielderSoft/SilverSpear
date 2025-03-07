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
public class ResourceEntity extends BaseModel {
    private String name;
    private String emailTemplate;
    private String landingPageTemplate;
}
