package com.example.jphish.Exceptions;

public class CampaignExistsException extends RuntimeException {
    public CampaignExistsException(String message) {
        super(message);
    }
}
