package mth.services;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Rolesmapping;
import mth.repository.RolesMappingRepository;

@Service
public class RolesMappingService {

	@Autowired
	RolesMappingRepository rolesMappingRepository;

	public Object addRoleMenuMapping(Map<String, Object> mappingData) {
		try {
			Object roleObj = mappingData.get("role");
			if (roleObj == null) {
				return Map.of("code", 400, "message", "Missing role value");
			}
			Long roleId = Long.valueOf(roleObj.toString());

			Object midsObject = mappingData.get("mids");
			Object menuIdObject = mappingData.get("mid");
			Object menuIdsObject = mappingData.get("menuids");

			if (midsObject == null && menuIdObject == null && menuIdsObject == null) {
				return Map.of("code", 400, "message", "Missing menu id(s)");
			}

			if (midsObject != null || menuIdsObject != null) {
				@SuppressWarnings("unchecked")
				List<Object> rawIds = (List<Object>) (midsObject != null ? midsObject : menuIdsObject);
				
				List<Long> menuIds = rawIds.stream()
					.filter(id -> id != null)
					.map(Object::toString)
					.map(Long::valueOf)
				.collect(Collectors.toList());
				for (Long menuId : menuIds) {
					Rolesmapping mapping = new Rolesmapping();
					mapping.setRole(roleId);
					mapping.setMid(menuId);
					rolesMappingRepository.save(mapping);
				}
			} else {
				Long menuId = Long.valueOf(menuIdObject.toString());
				Rolesmapping mapping = new Rolesmapping();
				mapping.setRole(roleId);
				mapping.setMid(menuId);
				rolesMappingRepository.save(mapping);
			}

			return Map.of(
				"code", 200,
				"message", "Role-Menu mapping added successfully"
			);
		} catch (Exception e) {
			return Map.of(
				"code", 500,
				"message", "Error adding role-menu mapping: " + e.getMessage()
			);
		}
	} 

	public Object getRoleMenuMapping(Long roleId) {
		try {
			List<Rolesmapping> mappings = rolesMappingRepository.findByRole(roleId);
			return Map.of(
				"code", 200,
				"message", "Role-Menu mapping fetched successfully",
				"data", mappings
			);
		} catch (Exception e) {
			return Map.of(
				"code", 500,
				"message", "Error fetching role-menu mapping: " + e.getMessage()
			);
		}
	}
}
