package mth.services;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Roles;
import mth.repository.RolesRepository;

@Service
public class RolesService {

	@Autowired
	RolesRepository rolesRepository;

	public Object addRole(Map<String, Object> roleData) {
		try {
			Roles role = new Roles();
			
			// Get the next role ID
			List<Roles> allRoles = rolesRepository.findAll();
			Long nextRoleId = allRoles.isEmpty() ? 1L : allRoles.stream()
				.map(Roles::getRole)
				.max(Long::compareTo)
				.orElse(0L) + 1;
			
			role.setRole(nextRoleId);
			role.setRolename((String) roleData.get("rolename"));
			
			rolesRepository.save(role);
			
			Map<String, Object> response = Map.of(
				"code", 200,
				"message", "Role added successfully",
				"data", role
			);
			return response;
		} catch (Exception e) {
			return Map.of(
				"code", 500,
				"message", "Error adding role: " + e.getMessage()
			);
		}
	}

	public Object getAllRoles() {
		try {
			List<Roles> roles = rolesRepository.findAll();
			return Map.of(
				"code", 200,
				"message", "Roles fetched successfully",
				"data", roles
			);
		} catch (Exception e) {
			return Map.of(
				"code", 500,
				"message", "Error fetching roles: " + e.getMessage()
			);
		}
	}
}
