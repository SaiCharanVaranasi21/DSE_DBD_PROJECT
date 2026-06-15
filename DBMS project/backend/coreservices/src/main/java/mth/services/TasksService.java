package mth.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Tasks;
import mth.repository.TasksRepository;

@Service
public class TasksService {
	
	@Autowired
	TasksRepository TR;
	
	public Object addTask(Tasks task)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			if(task.getTask() == null || task.getTask().trim().isEmpty())
			{
				response.put("code", 400);
				response.put("message", "Task name cannot be empty");
				return response;
			}
			
			task.setStatus(1);
			Tasks savedTask = TR.save(task);
			
			response.put("code", 200);
			response.put("message", "Task created successfully");
			response.put("data", savedTask);
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	public Object getAllTasks()
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			List<Tasks> tasks = TR.findAll();
			response.put("code", 200);
			response.put("data", tasks);
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	public Object deleteTask(Long taskId)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			Optional<Tasks> task = TR.findById(taskId);
			if(task.isPresent())
			{
				TR.deleteById(taskId);
				response.put("code", 200);
				response.put("message", "Task deleted successfully");
			}
			else
			{
				response.put("code", 404);
				response.put("message", "Task not found");
			}
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	public Object updateTask(Long taskId, Tasks taskData)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			Optional<Tasks> existingTask = TR.findById(taskId);
			Tasks task = null;

			if(existingTask.isPresent()) {
				task = existingTask.get();
			} else if(taskData.getTask() != null && !taskData.getTask().trim().isEmpty()) {
				// Fallback path in case the client sends a stale ID.
				Optional<Tasks> byName = TR.findTopByTaskOrderByIdDesc(taskData.getTask().trim());
				if(byName.isPresent())
					task = byName.get();
			}

			if(task == null) {
				response.put("code", 404);
				response.put("message", "Task not found");
				return response;
			}

			if(taskData.getTask() != null && !taskData.getTask().trim().isEmpty())
				task.setTask(taskData.getTask());
			if(taskData.getDesc() != null)
				task.setDesc(taskData.getDesc());
			if(taskData.getAssignedTo() != null)
				task.setAssignedTo(taskData.getAssignedTo());
			if(taskData.getDueDate() != null)
				task.setDueDate(taskData.getDueDate());
			if(taskData.getDueHour() != null)
				task.setDueHour(taskData.getDueHour());
			if(taskData.getDueMinute() != null)
				task.setDueMinute(taskData.getDueMinute());
			
			Tasks updatedTask = TR.save(task);
			response.put("code", 200);
			response.put("message", "Task updated successfully");
			response.put("data", updatedTask);
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
}
