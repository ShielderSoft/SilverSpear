package com.example.jphish.Controllers;

import com.example.jphish.Services.ValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"${app.cors.origin}", "http://localhost:5173"})
@RestController
@RequestMapping("/auth")
public class AuthController {

    private ValidationService validationService;

    public AuthController(ValidationService validationService) {
        this.validationService = validationService;
    }

    @PostMapping("/validate")
    public ResponseEntity<String> validateJwt(@RequestBody String token) {
        return validationService.validateToken(token);
    }
}
