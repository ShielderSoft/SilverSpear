package com.example.jphish.Services;

import com.example.jphish.Models.User;
import com.example.jphish.Models.UserGroup;
import com.example.jphish.Repositories.UserGroupRepository;
import com.example.jphish.Repositories.UserRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserGroupServiceImpl implements UserGroupService {

    private UserGroupRepository userGroupRepository;
    private UserRepository userRepository;

    public UserGroupServiceImpl(UserGroupRepository userGroupRepository, UserRepository userRepository) {
        this.userGroupRepository = userGroupRepository;
        this.userRepository = userRepository;
    }
    @Override
    public UserGroup createGroupWithUsers(String groupName, MultipartFile file) throws Exception {
        UserGroup userGroup = new UserGroup();
        userGroup.setGroupName(groupName);
        userGroup.setCreatedAt(LocalDateTime.now());

        List<User> users = parseUsersFromCSV(file);

        for (User user : users) {
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser.isEmpty()) {
                userGroup.getUsers().add(user);
            }
        }

        userGroupRepository.save(userGroup);

        return userGroup;
    }

    private List<User> parseUsersFromCSV(MultipartFile file) throws IOException {
        List<User> users = new ArrayList<>();

        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            CSVParser csvParser = new CSVParser(reader,
                    CSVFormat.DEFAULT.withHeader("Name", "Email").withSkipHeaderRecord());

            for (CSVRecord record : csvParser) {
                String name = record.get("Name");
                String email = record.get("Email");

                User user = new User();
                user.setName(name);
                user.setEmail(email);

                users.add(user);
            }
        }
        return users;
    }

    public UserGroup createGroup(UserGroup group) {
        UserGroup userGroup = new UserGroup();
        userGroup.setGroupName(group.getGroupName());
        userGroup.setCreatedAt(LocalDateTime.now());

        List<User> users = new ArrayList<>();
        for (User user : group.getUsers()) {
            User newUser = new User();
            newUser.setName(user.getName());
            newUser.setEmail(user.getEmail());
            users.add(newUser);
        }
        userGroup.setUsers(users);

        userGroupRepository.save(userGroup);
        return userGroup;
    }

    public List<UserGroup> allUserGroups() {
        return userGroupRepository.findAll();
    }

    public UserGroup findUserGroupById(Long id) {
        return userGroupRepository.findById(id).orElse(null);
    }

    public UserGroup findUserGroupByName(String name) {
        return userGroupRepository.findByGroupName(name);
    }

    public UserGroup deleteUserGroupById(Long id) {
        UserGroup deletedUserGroup = findUserGroupById(id);
        deletedUserGroup.setDeleted(true);
        userGroupRepository.save(deletedUserGroup);
        return deletedUserGroup;
    }
}

