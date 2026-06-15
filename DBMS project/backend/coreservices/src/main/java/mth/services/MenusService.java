package mth.services;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Menus;
import mth.repository.MenusRepository;

@Service
public class MenusService {

	@Autowired
	MenusRepository menusRepository;

	public Object addMenu(Map<String, Object> menuData) {
		try {
			Menus menu = new Menus();
			
			// Get the next menu ID
			List<Menus> allMenus = menusRepository.findAll();
			Long nextMenuId = allMenus.isEmpty() ? 1L : allMenus.stream()
				.map(Menus::getMid)
				.max(Long::compareTo)
				.orElse(0L) + 1;
			
			menu.setMid(nextMenuId);
			menu.setMenu((String) menuData.get("menu"));
			menu.setIcon((String) menuData.getOrDefault("icon", "dashboard.png"));
			
			menusRepository.save(menu);
			
			Map<String, Object> response = Map.of(
				"code", 200,
				"message", "Menu added successfully",
				"data", menu
			);
			return response;
		} catch (Exception e) {
			return Map.of(
				"code", 500,
				"message", "Error adding menu: " + e.getMessage()
			);
		}
	}

	public Object getAllMenus() {
		try {
			List<Menus> menus = menusRepository.findAll();
			return Map.of(
				"code", 200,
				"message", "Menus fetched successfully",
				"data", menus
			);
		} catch (Exception e) {
			return Map.of(
				"code", 500,
				"message", "Error fetching menus: " + e.getMessage()
			);
		}
	}
}
