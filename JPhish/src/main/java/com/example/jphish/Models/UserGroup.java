package com.example.jphish.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Entity
@Getter
@Setter
public class UserGroup extends BaseModel{

    private String groupName;
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<User> users;
    private LocalDateTime createdAt;
    private Long clientId;

    public UserGroup() {
        this.users = new ArrayList<>();
    }


}
