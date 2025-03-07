package com.example.jphish.Exceptions;

public class CampaignNotFound extends RuntimeException{
    public CampaignNotFound(String message){
        super(message);
    }
}
