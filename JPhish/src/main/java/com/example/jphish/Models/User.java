package com.example.jphish.Models;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@Table(name="target_user")
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class User extends BaseModel {
    private String name;
    private String email;
    private String phone;
    private Integer attacks;
    private boolean feedbackTaken;
    private String trainingStatus;
    private Integer answers;
}
