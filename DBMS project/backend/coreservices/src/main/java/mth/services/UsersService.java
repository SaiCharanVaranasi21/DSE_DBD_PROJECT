package mth.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Users;
import mth.repository.UsersRepository;

@Service
public class UsersService {

    @Autowired
    UsersRepository UR;

    @Autowired
    JwtService JWT;

    public Object signup(Users U) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object id = UR.checkByEmail(U.getEmail());
            if (id != null) {
                response.put("code", 501);
                response.put("message", "Email ID already registered");
            } else {
                if (U.getRole() <= 0 || U.getRole() > 3) {
                    U.setRole(1); // Default role: User
                }
                U.setStatus(1); // Active
                UR.save(U);
                response.put("code", 200);
                response.put("message", "User account has been created.");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Object signin(Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            Object role = UR.validateCredentials(
                    data.get("username").toString(),
                    data.get("password").toString());

            if (role != null) {
                String email = data.get("username").toString();
                // FIX: findByEmail now returns Users directly — no cast needed
                Users U = UR.findByEmail(email);

                response.put("code", 200);
                response.put("jwt", JWT.generateJWT(email, role));
                response.put("userId", U.getId());
                response.put("fullname", U.getFullname());
                response.put("role", U.getRole());
                response.put("firstLogin", U.getFirstLogin());
            } else {
                response.put("code", 404);
                response.put("message", "Invalid Credentials!");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Object uinfo(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> payload = JWT.validateJWT(token);
            String email = (String) payload.get("username");
            // FIX: findByEmail now returns Users directly — no cast needed
            Users U = UR.findByEmail(email);

            List<Object> menuList = UR.getMenus(Long.valueOf(U.getRole()));

            response.put("code", 200);
            response.put("fullname", U.getFullname());
            response.put("menulist", menuList);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Object getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Users> users = UR.findAll();
            response.put("code", 200);
            response.put("data", users);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Object getUserById(Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Users user = UR.findById(id).orElse(null);
            if (user != null) {
                response.put("code", 200);
                response.put("data", user);
            } else {
                response.put("code", 404);
                response.put("message", "User not found");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Object completeOnboarding(Long userId, Map<String, Object> profileData) {
        Map<String, Object> response = new HashMap<>();
        try {
            Users user = UR.findById(userId).orElse(null);
            if (user != null) {
                user.setFirstLogin(false);
                if (profileData != null) {
                    if (profileData.containsKey("fullname") && profileData.get("fullname") != null) {
                        user.setFullname(profileData.get("fullname").toString());
                    }
                    if (profileData.containsKey("email") && profileData.get("email") != null) {
                        user.setEmail(profileData.get("email").toString());
                    }
                    if (profileData.containsKey("phone") && profileData.get("phone") != null) {
                        user.setPhone(profileData.get("phone").toString());
                    }
                    if (profileData.containsKey("dateOfBirth") && profileData.get("dateOfBirth") != null) {
                        user.setDateOfBirth(profileData.get("dateOfBirth").toString());
                    }
                    if (profileData.containsKey("preferredCurrency") && profileData.get("preferredCurrency") != null) {
                        user.setPreferredCurrency(profileData.get("preferredCurrency").toString());
                    }
                }
                UR.save(user);
                response.put("code", 200);
                response.put("message", "Onboarding completed successfully");
            } else {
                response.put("code", 404);
                response.put("message", "User not found");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Object changePassword(Long userId, String currentPassword, String newPassword) {
        Map<String, Object> response = new HashMap<>();
        try {
            Users user = UR.findById(userId).orElse(null);
            if (user == null) {
                response.put("code", 404);
                response.put("message", "User not found");
            } else if (!user.getPassword().equals(currentPassword)) {
                response.put("code", 400);
                response.put("message", "Incorrect current password");
            } else {
                user.setPassword(newPassword);
                UR.save(user);
                response.put("code", 200);
                response.put("message", "Password changed successfully");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Object deleteUser(Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (UR.existsById(id)) {
                UR.deleteById(id);
                response.put("code", 200);
                response.put("message", "User deleted successfully");
            } else {
                response.put("code", 404);
                response.put("message", "User not found");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", e.getMessage());
        }
        return response;
    }
}
