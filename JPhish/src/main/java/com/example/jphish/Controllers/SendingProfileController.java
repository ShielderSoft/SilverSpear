package com.example.jphish.Controllers;

import com.example.jphish.Models.SendingProfile;
import com.example.jphish.Services.SendingProfileService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

 @CrossOrigin(origins = {"${app.cors.origin}", "http://localhost:5173"})
@RestController
@RequestMapping("/profile")
public class SendingProfileController {
    private SendingProfileService sendingProfileService;

    public SendingProfileController(SendingProfileService sendingProfileService) {
        this.sendingProfileService = sendingProfileService;
    }
    @PostMapping("/create")
    public ResponseEntity<String> createProfile(@RequestBody SendingProfile sendingProfile) throws Exception {
        sendingProfileService.createProfile(sendingProfile);
        return new ResponseEntity<>("Profile created successfully", HttpStatus.OK);
    }

    @GetMapping("/get")
    public ResponseEntity<List<SendingProfile>> getAllProfiles() {
        List<SendingProfile> allProfiles = sendingProfileService.allProfile();
        return new ResponseEntity<>(allProfiles, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public  SendingProfile getProfileById(@PathVariable Long id) {
        SendingProfile profile = sendingProfileService.getProfileById(id);
        return profile;
    }

     @DeleteMapping("/{id}")
     public ResponseEntity<String> deleteProfile(@PathVariable Long id) {
         try {
             sendingProfileService.deleteProfile(id);
             return new ResponseEntity<>("Profile deleted successfully", HttpStatus.OK);
         } catch (Exception e) {
             return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
         }
     }
}
