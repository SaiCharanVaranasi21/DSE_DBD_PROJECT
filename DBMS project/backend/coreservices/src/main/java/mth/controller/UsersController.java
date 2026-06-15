package mth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.models.Users;
import mth.services.UsersService;
import mth.services.UserFinancialService;
import mth.services.RolesService;
import mth.services.MenusService;
import mth.services.RolesMappingService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/authservice")
public class UsersController {

	@Autowired
	UsersService US;

	@Autowired
	UserFinancialService UFS;

	@Autowired
	RolesService rolesService;

	@Autowired
	MenusService menusService;

	@Autowired
	RolesMappingService rolesMappingService;

	@CrossOrigin(origins = "*")

	@PostMapping("/signup")
	public Object signup(@RequestBody Users U)
	{
		return US.signup(U);
	}

	@PostMapping("/signin")
	public Object signin(@RequestBody Map<String, Object> data)
	{
		return US.signin(data);
	}

	@GetMapping("/uinfo")
	public Object uinfo(@RequestHeader("Token") String token)
	{
		return US.uinfo(token);
	}

	@GetMapping("/users")
	public Object getAllUsers()
	{
		return US.getAllUsers();
	}

	@GetMapping("/users/{id}")
	public Object getUserById(@PathVariable Long id)
	{
		return US.getUserById(id);
	}

	@PutMapping("/users/{id}/complete-onboarding")
	public Object completeOnboarding(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> profileData)
	{
		return US.completeOnboarding(id, profileData);
	}

	@GetMapping("/test")
	public String testMethod()
	{
		return "Welcome I'm fine";
	}

	// ===== ROLES ENDPOINTS =====
	@PostMapping("/roles")
	public Object addRole(@RequestBody Map<String, Object> roleData)
	{
		return rolesService.addRole(roleData);
	}

	@GetMapping("/roles")
	public Object getAllRoles()
	{
		return rolesService.getAllRoles();
	}

	// ===== MENUS ENDPOINTS =====
	@PostMapping("/menus")
	public Object addMenu(@RequestBody Map<String, Object> menuData)
	{
		return menusService.addMenu(menuData);
	}

	@GetMapping("/menus")
	public Object getAllMenus()
	{
		return menusService.getAllMenus();
	}

	// ===== ROLE-MENU MAPPING ENDPOINTS =====
	@PostMapping("/rolesmapping")
	public Object addRoleMenuMapping(@RequestBody Map<String, Object> mappingData)
	{
		return rolesMappingService.addRoleMenuMapping(mappingData);
	}

	@PostMapping("/change-password")
	public Object changePassword(@RequestBody Map<String, Object> request)
	{
		Long userId = Long.valueOf(request.get("userId").toString());
		String currentPassword = request.get("currentPassword").toString();
		String newPassword = request.get("newPassword").toString();
		return US.changePassword(userId, currentPassword, newPassword);
	}

	@org.springframework.web.bind.annotation.DeleteMapping("/users/{id}")
	public Object deleteUser(@PathVariable Long id)
	{
		return US.deleteUser(id);
	}
}
