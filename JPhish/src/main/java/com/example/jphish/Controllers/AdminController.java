package com.example.jphish.Controllers;

import com.example.jphish.Dtos.AdminLoginDto;
import com.example.jphish.Exceptions.UserExistsException;
import com.example.jphish.Exceptions.WrongPasswordException;
import com.example.jphish.Models.Admin;
import com.example.jphish.Repositories.AdminRepository;
import com.example.jphish.Services.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"${app.cors.origin}", "http://localhost:5173"})
@RestController
@RequestMapping("/admin")
public class AdminController {
    private AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/adup")
    public ResponseEntity<Admin> AdminCreation(@RequestBody Admin admin) throws UserExistsException {
        Admin newAdmin = adminService.CreateAdmin(admin);
        return new ResponseEntity<>(newAdmin, HttpStatus.OK);
    }

    @PostMapping("/adlog")
    public ResponseEntity<String> AdLogin(@RequestBody AdminLoginDto adminLoginDto) throws UserExistsException, WrongPasswordException {
        String response = adminService.AdminLogin(adminLoginDto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
