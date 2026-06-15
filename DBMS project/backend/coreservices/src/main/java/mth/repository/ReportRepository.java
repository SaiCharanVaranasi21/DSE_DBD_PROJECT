package mth.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import mth.models.Report;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUserId(Long userId);
    List<Report> findByUserIdAndMonth(Long userId, String month);
}
