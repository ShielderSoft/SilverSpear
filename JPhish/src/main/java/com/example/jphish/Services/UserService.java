package com.example.jphish.Services;

import com.example.jphish.Dtos.CreateUserDto;
import com.example.jphish.Dtos.LearningStatusDto;
import com.example.jphish.Exceptions.UserExistsException;
import com.example.jphish.Exceptions.UserNotFound;
import com.example.jphish.Models.User;

import java.util.List;

public interface UserService {
     User createUser (CreateUserDto createUserDto) throws UserExistsException;
    List<User> findUserByName(String name);
    List<User> findAllUsers();
    User findUserByEmail(String email) throws UserNotFound;
    User updateUserLearningStatus(String email, LearningStatusDto learningStatusDto) throws UserNotFound;
    User findUserById(Long id) throws UserNotFound;
}
