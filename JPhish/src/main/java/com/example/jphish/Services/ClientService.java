package com.example.jphish.Services;

import com.example.jphish.Dtos.ClientDto;
import com.example.jphish.Dtos.ClientLoginDto;
import com.example.jphish.Dtos.ClientResponseDto;
import com.example.jphish.Models.Client;
import com.example.jphish.Repositories.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Autowired
    public ClientService(ClientRepository clientRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.clientRepository = clientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Client createClient(Client client) {
        // Encode password before saving
        client.setClientPassword(passwordEncoder.encode(client.getClientPassword()));
        return clientRepository.save(client);
    }

    public ClientResponseDto loginClient(ClientLoginDto loginDto) {
        Client client = clientRepository.findByClientEmail(loginDto.getClientEmail())
                .orElseThrow(() -> new RuntimeException("Client not found with this email"));

        // Validate password
        if (!passwordEncoder.matches(loginDto.getClientPassword(), client.getClientPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate JWT token
        String token = jwtService.generateToken(client.getId(), client.getClientName(), "CLIENT");

        // Create response
        ClientResponseDto responseDto = new ClientResponseDto();
        responseDto.setClientName(client.getClientName());
        responseDto.setClientCompany(client.getClientCompany());
        responseDto.setToken(token);

        return responseDto;
    }

    public ClientDto mapToDto(Client client) {
        ClientDto dto = new ClientDto();
        dto.setClientName(client.getClientName());
        dto.setClientCompany(client.getClientCompany());
        return dto;
    }
}