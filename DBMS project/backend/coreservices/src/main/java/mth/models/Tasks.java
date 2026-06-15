package mth.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Tasks {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	
	String task;
	
	@Column(name = "task_desc", columnDefinition = "TEXT")
	String desc;
	
	int status;

	Long assignedTo;

	String dueDate;

	Integer dueHour;

	Integer dueMinute;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTask() {
		return task;
	}

	public void setTask(String task) {
		this.task = task;
	}

	public String getDesc() {
		return desc;
	}

	public void setDesc(String desc) {
		this.desc = desc;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public Long getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(Long assignedTo) {
		this.assignedTo = assignedTo;
	}

	public String getDueDate() {
		return dueDate;
	}

	public void setDueDate(String dueDate) {
		this.dueDate = dueDate;
	}

	public Integer getDueHour() {
		return dueHour;
	}

	public void setDueHour(Integer dueHour) {
		this.dueHour = dueHour;
	}

	public Integer getDueMinute() {
		return dueMinute;
	}

	public void setDueMinute(Integer dueMinute) {
		this.dueMinute = dueMinute;
	}
}
