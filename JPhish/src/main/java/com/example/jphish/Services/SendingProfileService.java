package com.example.jphish.Services;

import com.example.jphish.Models.SendingProfile;
import com.example.jphish.Repositories.SendingProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SendingProfileService {
    private SendingProfileRepository sendingProfileRepository;

    public SendingProfileService(SendingProfileRepository sendingProfileRepository) {
        this.sendingProfileRepository = sendingProfileRepository;
    }

    @Transactional
    public SendingProfile createProfile(SendingProfile sendingProfile, Long clientId) throws Exception {
        Optional<SendingProfile> optionalSendingProfile = sendingProfileRepository.findByProfileEmailId(sendingProfile.getProfileEmailId());
        if (!optionalSendingProfile.isPresent()) {
            SendingProfile newSendingProfile = new SendingProfile();
            newSendingProfile.setProfileEmailId(sendingProfile.getProfileEmailId());
            newSendingProfile.setProfileName(sendingProfile.getProfileName());
            newSendingProfile.setProfileSMTPHost(sendingProfile.getProfileSMTPHost());
            newSendingProfile.setProfileSMTPPort(sendingProfile.getProfileSMTPPort());
            newSendingProfile.setProfileSMTPUsername(sendingProfile.getProfileSMTPUsername());
            newSendingProfile.setProfileSMTPPassword(sendingProfile.getProfileSMTPPassword());
            newSendingProfile.setProfileDesc(sendingProfile.getProfileDesc());
            newSendingProfile.setDomainTld(sendingProfile.getDomainTld());
            newSendingProfile.setClientId(clientId);
            return sendingProfileRepository.save(newSendingProfile);
        } else {
            throw new Exception("Profile with the provided Email ID already exists.");
        }
    }

    public List<SendingProfile> allProfile(Long clientId){
        // If admin (clientId = 0L), return all profiles
        if (clientId == 0L) {
            return sendingProfileRepository.findAll();
        }
        // For regular clients, filter by clientId
        return sendingProfileRepository.findByClientId(clientId);
    }

    public SendingProfile getProfileById(Long id, Long clientId){
        SendingProfile profile = sendingProfileRepository.getProfileById(id);
        // If admin (clientId = 0L) or matching clientId, return the profile
        if (profile != null && (clientId == 0L || profile.getClientId().equals(clientId))) {
            return profile;
        }
        return null;
    }

    public void deleteProfile(Long id, Long clientId) throws Exception {
        SendingProfile profile = sendingProfileRepository.getProfileById(id);
        if (profile != null && (clientId == 0L || profile.getClientId().equals(clientId))) {
            sendingProfileRepository.deleteById(id);
        } else {
            throw new Exception("Profile with the provided ID does not exist or you don't have permission to delete it.");
        }
    }
}