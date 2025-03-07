package com.example.jphish.Services;

import com.example.jphish.Dtos.AdminLoginDto;
import com.example.jphish.Exceptions.UserExistsException;
import com.example.jphish.Exceptions.WrongPasswordException;
import com.example.jphish.Models.Admin;

public interface AdminService {
    public Admin CreateAdmin(Admin admin) throws UserExistsException;
    public String AdminLogin(AdminLoginDto adminLoginDto) throws UserExistsException, WrongPasswordException;
}
