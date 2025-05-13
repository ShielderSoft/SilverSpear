package com.example.jphish.Controllers;

import com.example.jphish.Models.UserGroup;
import com.example.jphish.Services.JwtService;
import com.example.jphish.Services.UserGroupService;
import com.example.jphish.Services.ValidationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/usergroup")
public class UserGroupController {

    private UserGroupService userGroupService;
    private JwtService jwtService;
    private ValidationService validationService;

    public UserGroupController(UserGroupService userGroupService, JwtService jwtService, ValidationService validationService) {
        this.userGroupService = userGroupService;
        this.jwtService = jwtService;
        this.validationService = validationService;
    }

    // Helper method to extract clientId from token
    private Long extractClientId(HttpServletRequest request) {
        String clearance = request.getHeader("clearance");
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // Admin authentication flow
            if ("Admin".equals(clearance)) {
                ResponseEntity<String> response = validationService.validateToken(token);
                if (response.getStatusCode() == HttpStatus.OK) {
                    return 0L; // Admin access with clientId 0
                }
            }
            // Client authentication flow
            else if ("Client".equals(clearance)) {
                try {
                    return jwtService.extractClientId(token);
                } catch (Exception e) {
                    // Token validation failed
                    return null;
                }
            }
        }
        return null; // Invalid authentication
    }

    @PostMapping("/create")
    public ResponseEntity<UserGroup> createUserGroup(
            @RequestPart("Groupname") String userGroupName,
            @RequestPart("file") MultipartFile file,
            HttpServletRequest request) throws Exception {

        Long clientId = extractClientId(request);
        UserGroup newUserGroup = userGroupService.createGroupWithUsers(userGroupName, file, clientId);
        return new ResponseEntity<>(newUserGroup, HttpStatus.OK);
    }

    @PostMapping("/createGroup")
    public ResponseEntity<String> createGroup(@RequestBody UserGroup group, HttpServletRequest request) {
        Long clientId = extractClientId(request);
        userGroupService.createGroup(group, clientId);
        return new ResponseEntity<>("Group created successfully", HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserGroup>> groupAll(HttpServletRequest request) {
        Long clientId = extractClientId(request);
        List<UserGroup> allGroups = userGroupService.allUserGroups(clientId);
        return new ResponseEntity<>(allGroups, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserGroup> getUserGroup(@PathVariable("id") Long userGroupId, HttpServletRequest request) {
        Long clientId = extractClientId(request);
        UserGroup group = userGroupService.findUserGroupById(userGroupId, clientId);
        if (group != null) {
            return new ResponseEntity<>(group, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<UserGroup> getUserGroupByName(@PathVariable("name") String userGroupName, HttpServletRequest request) {
        Long clientId = extractClientId(request);
        UserGroup group = userGroupService.findUserGroupByName(userGroupName, clientId);
        if (group != null) {
            return new ResponseEntity<>(group, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }

    @PostMapping("/del/{id}")
    public ResponseEntity<UserGroup> deleteUserGroup(@PathVariable("id") Long userGroupId, HttpServletRequest request) {
        Long clientId = extractClientId(request);
        UserGroup deletedGroup = userGroupService.deleteUserGroupById(userGroupId, clientId);
        if (deletedGroup != null) {
            return new ResponseEntity<>(deletedGroup, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }
}