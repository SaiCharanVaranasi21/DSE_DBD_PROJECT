package mth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.models.Tasks;
import mth.services.TasksService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/taskservice")
public class TasksController {

	@Autowired
	TasksService tasksService;
	
	@PostMapping("/tasks")
	public Object addTask(@RequestBody Tasks task, @RequestHeader(value = "Token", required = false) String token)
	{
		return tasksService.addTask(task);
	}
	
	@GetMapping("/tasks")
	public Object getAllTasks(@RequestHeader(value = "Token", required = false) String token)
	{
		return tasksService.getAllTasks();
	}
	
	@DeleteMapping("/tasks/{id}")
	public Object deleteTask(@PathVariable Long id, @RequestHeader(value = "Token", required = false) String token)
	{
		return tasksService.deleteTask(id);
	}
	
	@PutMapping("/tasks/{id}")
	public Object updateTask(@PathVariable Long id, @RequestBody Tasks taskData, @RequestHeader(value = "Token", required = false) String token)
	{
		return tasksService.updateTask(id, taskData);
	}
}
