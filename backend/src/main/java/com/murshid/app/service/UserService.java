package com.murshid.app.service;

import com.murshid.app.dto.AuthRequest;
import com.murshid.app.model.User;
import com.murshid.app.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public User register(AuthRequest req) {
		Optional<User> exists = userRepository.findByEmail(req.getEmail());
		if (exists.isPresent()) {
			throw new RuntimeException("User already exists");
		}
		String hashed = passwordEncoder.encode(req.getPassword());
		User u = new User(req.getEmail(), hashed);
		return userRepository.save(u);
	}

	public User login(AuthRequest req) {
		User user = userRepository.findByEmail(req.getEmail())
				.orElseThrow(() -> new RuntimeException("Invalid credentials"));
		if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
			throw new RuntimeException("Invalid credentials");
		}
		return user;
	}
}
