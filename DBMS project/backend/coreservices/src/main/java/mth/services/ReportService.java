package mth.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import mth.models.Report;
import mth.repository.ReportRepository;

@Service
public class ReportService {

    @Autowired
    private ReportRepository repo;

    public List<Report> getReportsByUser(Long userId) {
        return repo.findByUserId(userId);
    }

    public List<Report> getReportsByUserAndMonth(Long userId, String month) {
        return repo.findByUserIdAndMonth(userId, month);
    }

    public Report saveReport(Report report) {
        // Check if report for user and month already exists
        List<Report> existing = repo.findByUserIdAndMonth(report.getUserId(), report.getMonth());
        if (existing != null && !existing.isEmpty()) {
            Report dbReport = existing.get(0);
            dbReport.setTotalIncome(report.getTotalIncome());
            dbReport.setTotalExpense(report.getTotalExpense());
            dbReport.setReportType(report.getReportType());
            return repo.save(dbReport);
        }
        return repo.save(report);
    }

    public void deleteReport(Long id) {
        repo.deleteById(id);
    }
}
