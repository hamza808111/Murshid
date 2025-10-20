package com.murshid.app.controller;

import com.murshid.app.dto.AuthRequest;
import com.murshid.app.dto.AuthResponse;
import com.murshid.app.model.User;
import com.murshid.app.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest req) {
        User u = userService.register(req);
        return ResponseEntity.ok(new AuthResponse(u.getId(), u.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        User u = userService.login(req);
        return ResponseEntity.ok(new AuthResponse(u.getId(), u.getEmail()));
    }
}
