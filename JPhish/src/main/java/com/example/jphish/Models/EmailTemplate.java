package com.example.jphish.Models;

import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplate extends BaseModel{
    private String name;
    private String subject;
    @Lob
    private byte[] body;
    private String phishingLink;
}
