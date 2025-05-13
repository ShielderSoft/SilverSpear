package com.example.jphish.Models;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LandingPageTemplate extends BaseModel{
    private String name;
    private byte[]  code;
    private Long clientId;
}
