package com.example.jphish.Services;

import com.example.jphish.Models.UserGroup;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserGroupService {
    public UserGroup createGroupWithUsers(String groupName, MultipartFile file, Long clientId) throws Exception;
    public List<UserGroup> allUserGroups(Long clientId);
    public UserGroup findUserGroupById(Long id, Long clientId);
    public UserGroup deleteUserGroupById(Long id, Long clientId);
    public UserGroup findUserGroupByName(String name, Long clientId);
    public UserGroup createGroup(UserGroup group, Long clientId);
}
