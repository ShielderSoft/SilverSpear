package com.example.jphish.Services;

import com.example.jphish.Models.User;
import com.example.jphish.Models.UserGroup;
import com.example.jphish.Repositories.UserGroupRepository;
import com.example.jphish.Repositories.UserRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
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
    public UserGroup createGroupWithUsers(String groupName, MultipartFile file, Long clientId) throws Exception {
        UserGroup userGroup = new UserGroup();
        userGroup.setGroupName(groupName);
        userGroup.setCreatedAt(LocalDateTime.now());
        userGroup.setClientId(clientId);

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
                    CSVFormat.DEFAULT.withHeader("Name", "Email", "Phone").withSkipHeaderRecord());

            for (CSVRecord record : csvParser) {
                String name = record.get("Name");
                String email = record.get("Email");
                String phone = record.get("Phone");

                User user = new User();
                user.setName(name);
                user.setEmail(email);
                user.setPhone(phone);

                users.add(user);
            }
        }
        return users;
    }

    public UserGroup createGroup(UserGroup group, Long clientId) {
        UserGroup userGroup = new UserGroup();
        userGroup.setGroupName(group.getGroupName());
        userGroup.setCreatedAt(LocalDateTime.now());
        userGroup.setClientId(clientId);

        List<User> users = new ArrayList<>();
        for (User user : group.getUsers()) {
            User newUser = new User();
            newUser.setName(user.getName());
            newUser.setEmail(user.getEmail());
            newUser.setPhone(user.getPhone());
            users.add(newUser);
        }
        userGroup.setUsers(users);

        userGroupRepository.save(userGroup);
        return userGroup;
    }

    @Override
    public List<UserGroup> allUserGroups(Long clientId) {
        // Special case for admin (clientId = 0L)
        if (clientId == 0L) {
            return userGroupRepository.findAll();
        }
        // For regular clients, filter by clientId
        return userGroupRepository.findByClientId(clientId);
    }

    @Override
    public UserGroup findUserGroupById(Long id, Long clientId) {
        UserGroup group = userGroupRepository.findById(id).orElse(null);
        // If admin (clientId = 0L) or matching clientId, return the group
        if (group != null && (clientId == 0L || group.getClientId().equals(clientId))) {
            return group;
        }
        return null;
    }

    @Override
    public UserGroup findUserGroupByName(String name, Long clientId) {
        UserGroup group = userGroupRepository.findByGroupName(name);
        if (group != null && (clientId == 0L || group.getClientId().equals(clientId))) {
            return group;
        }
        return null;
    }

    @Override
    public UserGroup deleteUserGroupById(Long id, Long clientId) {
        UserGroup group = findUserGroupById(id, clientId);
        if (group != null) {
            group.setDeleted(true);
            userGroupRepository.save(group);
        }
        return group;
    }
}