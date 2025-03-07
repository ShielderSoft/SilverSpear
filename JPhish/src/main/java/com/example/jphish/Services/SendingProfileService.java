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
    public SendingProfile createProfile(SendingProfile sendingProfile) throws Exception {
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
            return sendingProfileRepository.save(newSendingProfile);
        } else {
            throw new Exception("Profile with the provided Email ID already exists.");
        }
    }

    public List<SendingProfile> allProfile(){
        return sendingProfileRepository.findAll();
    }

    public SendingProfile getProfileById(Long id){
        return sendingProfileRepository.getProfileById(id);
    }

    public void deleteProfile(Long id) throws Exception {
        Optional<SendingProfile> optionalSendingProfile = sendingProfileRepository.findById(id);
        if (optionalSendingProfile.isPresent()) {
            sendingProfileRepository.deleteById(id);
        } else {
            throw new Exception("Profile with the provided ID does not exist.");
        }
    }
}
