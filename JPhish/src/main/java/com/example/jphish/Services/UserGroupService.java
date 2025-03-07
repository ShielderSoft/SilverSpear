package com.example.jphish.Services;

import com.example.jphish.Models.UserGroup;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserGroupService {
    public UserGroup createGroupWithUsers(String groupName, MultipartFile file) throws Exception;
    public List<UserGroup> allUserGroups();
    public UserGroup findUserGroupById(Long id);
    public UserGroup deleteUserGroupById(Long id);
    public UserGroup findUserGroupByName(String name);
    public UserGroup createGroup(UserGroup group);
}
