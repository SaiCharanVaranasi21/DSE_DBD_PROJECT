package mth.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mth.models.Tasks;

@Repository
public interface TasksRepository extends JpaRepository<Tasks, Long> {
	Optional<Tasks> findTopByTaskOrderByIdDesc(String task);
}
