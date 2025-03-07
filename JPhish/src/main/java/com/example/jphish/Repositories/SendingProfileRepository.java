package com.example.jphish.Repositories;

import com.example.jphish.Models.SendingProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SendingProfileRepository extends JpaRepository<SendingProfile, Long> {

    Optional<SendingProfile> findByProfileEmailId(String profileEmailId);
    public SendingProfile getProfileById(Long id);
}
