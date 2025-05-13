package com.example.jphish.Controllers;

import com.example.jphish.Dtos.ClientDto;
import com.example.jphish.Dtos.ClientLoginDto;
import com.example.jphish.Dtos.ClientResponseDto;
import com.example.jphish.Models.Client;
import com.example.jphish.Services.ClientService;
import com.example.jphish.Services.ValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
//@CrossOrigin(origins = {"http://147.93.111.204:5173", "http://localhost:5173"})
public class ClientController {

    private final ClientService clientService;
    private final ValidationService validationService;

    @Autowired
    public ClientController(ClientService clientService, ValidationService validationService) {
        this.clientService = clientService;
        this.validationService = validationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> createClient(
            @RequestBody Client client,
            @RequestHeader("Authorization") String authHeader) {

        // Extract token from Authorization header
        String token = authHeader.replace("Bearer ", "");

        // Validate admin token using ValidationService
        ResponseEntity<String> validationResponse = validationService.validateToken(token);

        if (validationResponse.getStatusCode() != HttpStatus.OK) {
            return new ResponseEntity<>("Unauthorized: Only admins can create clients",
                    HttpStatus.UNAUTHORIZED);
        }

        // If token is valid, proceed with client creation
        Client savedClient = clientService.createClient(client);
        return ResponseEntity.ok(clientService.mapToDto(savedClient));
    }

    @PostMapping("/login")
    public ResponseEntity<ClientResponseDto> loginClient(@RequestBody ClientLoginDto loginDto) {
        ClientResponseDto responseDto = clientService.loginClient(loginDto);
        return ResponseEntity.ok(responseDto);
    }
}