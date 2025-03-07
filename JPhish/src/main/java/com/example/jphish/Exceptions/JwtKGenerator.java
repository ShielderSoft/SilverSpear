//package com.example.jphish.Exceptions;
//
//import io.jsonwebtoken.SignatureAlgorithm;
//import io.jsonwebtoken.security.Keys;
//import javax.crypto.SecretKey;
//import java.util.Base64;
//
//public class JwtKGenerator {
//
//    public static void main(String[] args) {
//        SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256); // Generate HS256 key
//        String encodedKey = Base64.getEncoder().encodeToString(secretKey.getEncoded());
//
//        // Print out the Base64-encoded key (this is the key you can store)
//        System.out.println("Generated Secret Key (Base64 Encoded): " + encodedKey);
//    }
//}

