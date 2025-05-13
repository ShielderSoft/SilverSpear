package com.example.jphish.Repositories;

import com.example.jphish.Models.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserGroupRepository extends JpaRepository<UserGroup, Long> {
    UserGroup findByGroupName(String groupName);
    List<UserGroup> findByClientId(Long clientId);
}
