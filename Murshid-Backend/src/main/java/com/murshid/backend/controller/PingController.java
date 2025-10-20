package com.murshid.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PingController {

  @GetMapping("/ping")
  public Map<String, Object> ping(@AuthenticationPrincipal Jwt jwt) {
    return Map.of(
      "message", "pong",
      "sub", jwt.getSubject(),
      "email", jwt.getClaimAsString("email")
    );
  }
}


