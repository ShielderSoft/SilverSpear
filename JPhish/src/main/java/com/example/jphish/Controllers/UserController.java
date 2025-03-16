package com.example.jphish.Controllers;

import com.example.jphish.Dtos.CreateUserDto;
import com.example.jphish.Dtos.LearningStatusDto;
import com.example.jphish.Exceptions.UserExistsException;
import com.example.jphish.Exceptions.UserNotFound;
import com.example.jphish.Models.User;
import com.example.jphish.Services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = {"${app.cors.origin}", "http://localhost:5173"})
@RestController
@RequestMapping("/user")
public class UserController {
    private  UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<User> signUp(@RequestBody CreateUserDto createUserDto) throws UserExistsException {
        User user = userService.createUser(createUserDto);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/em")
    public User byEmail(@RequestBody Map<String, String> requestBody) throws UserNotFound {
        String email = requestBody.get("email");
       return userService.findUserByEmail(email);
    }

    @GetMapping("/nm")
    public ResponseEntity<List<User>> byName(@RequestBody String name ) {
        List<User> user = userService.findUserByName(name);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/all")
    public List<User> allUsers() {
        return userService.findAllUsers();
    }

    // language: java
    @PostMapping("/update-learning-status/{email}")
    public ResponseEntity<User> updateLearningStatus(
            @PathVariable String email,
            @RequestBody LearningStatusDto learningStatusDto) throws UserNotFound {
        User updatedUser = userService.updateUserLearningStatus(email, learningStatusDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/{id}")
    public User userById(@PathVariable Long id) throws UserNotFound {
        return userService.findUserById(id);
    }

}
