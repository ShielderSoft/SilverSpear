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

import java.util.List;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long id) {
        try {
            adminService.deleteAdmin(id);
            return new ResponseEntity<>("Admin deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete admin: " + e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/every")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        try {
            List<Admin> admins = adminService.getAllAdmins();
            return new ResponseEntity<>(admins, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
