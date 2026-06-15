package mth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import mth.models.UserFinancialProfile;
import mth.services.UserFinancialService;

@RestController
@RequestMapping("/financial")
@CrossOrigin("*")
public class UserFinancialController {

    @Autowired
    private UserFinancialService service;

    @PostMapping("/save")
    public Object save(
            @RequestBody UserFinancialProfile profile
    ) {
        return service.saveProfile(profile);
    }

    @GetMapping("/{userId}")
    public Object get(
            @PathVariable Long userId
    ) {
        return service.getProfile(userId);
    }

    @PutMapping("/update/{userId}")
    public Object update(
            @PathVariable Long userId,
            @RequestBody UserFinancialProfile profile
    ) {
        profile.setUserId(userId);
        return service.saveProfile(profile);
    }
}