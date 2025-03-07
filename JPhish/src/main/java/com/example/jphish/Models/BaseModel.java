package com.example.jphish.Models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;


@Getter
@Setter
@MappedSuperclass
public class BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime createDate;
    private LocalDateTime LastUpdateDate;
    private boolean deleted;

    @PrePersist
    protected void onCreate() {
        this.createDate = LocalDateTime.now();
        this.LastUpdateDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.LastUpdateDate = LocalDateTime.now();
    }

}
