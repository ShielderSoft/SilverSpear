package com.example.jphish.Services;

import com.example.jphish.Dtos.AdminLoginDto;
import com.example.jphish.Exceptions.UserExistsException;
import com.example.jphish.Exceptions.UserNotFound;
import com.example.jphish.Exceptions.WrongPasswordException;
import com.example.jphish.Models.Admin;
import com.example.jphish.Models.Session;
import com.example.jphish.Repositories.AdminRepository;
import com.example.jphish.Repositories.SessionRepository;
import lombok.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminServiceImpl implements AdminService {

    private AdminRepository adminRepository;
    private PasswordEncoder passwordEncoder;
    private SessionRepository sessionRepository;

    private SecretKey key = Keys.hmacShaKeyFor("yLp1Eyu4+wv7LptT79Kb4lAQWxyGSAmqVIpL/gqqyIo="
                    .getBytes(StandardCharsets.UTF_8));

    public AdminServiceImpl(AdminRepository adminRepository,
                            PasswordEncoder passwordEncoder,
                            SessionRepository sessionRepository) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionRepository = sessionRepository;
    }

    public Admin CreateAdmin(Admin admin) throws UserExistsException {
        Optional<Admin> optionalAdmin = adminRepository.findByEmail(admin.getEmail());
        if (!optionalAdmin.isPresent()) {
            Admin newAdmin = new Admin();
            newAdmin.setUsername(admin.getUsername());
            newAdmin.setEmail(admin.getEmail());
            newAdmin.setPassword(passwordEncoder.encode(admin.getPassword()));
            adminRepository.save(newAdmin);

            return newAdmin;
        }
        else{throw new UserExistsException("Admin already present");}
    }

    public String AdminLogin(@NonNull AdminLoginDto adminLoginDto) throws WrongPasswordException, UserNotFound {
        Optional<Admin> optionalAdmin = adminRepository.findByEmail(adminLoginDto.getEmail());
        if (!optionalAdmin.isPresent()) {
            throw new UserNotFound("You are not Admin");
        }

        boolean matches = passwordEncoder.matches(adminLoginDto.getPassword(), optionalAdmin.get().getPassword());

        if (matches) {
            String token = createJwtToken(optionalAdmin.get().getId(), optionalAdmin.get().getEmail());

            Session newSession = new Session();
            newSession.setUsername(optionalAdmin.get().getUsername());
            newSession.setToken(token);
            sessionRepository.save(newSession);

            return token;
        } else {
            throw new WrongPasswordException("Wrong Credentials");
        }
    }

    public void deleteAdmin(Long id) {
        if (!adminRepository.existsById(id)) {
            throw new RuntimeException("Admin not found with id: " + id);
        }
        adminRepository.deleteById(id);
    }


    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    private String createJwtToken(Long userId,String email) {
        Map<String, Object> dataInJwt = new HashMap<>();
        dataInJwt.put("user_id", userId);
        dataInJwt.put("email", email);
        dataInJwt.put("permit", "Allowed");

        String token = Jwts.builder()
                .claims(dataInJwt)
                .issuedAt(new Date())
                .signWith(key)
                .compact();

        return token;
    }
}
