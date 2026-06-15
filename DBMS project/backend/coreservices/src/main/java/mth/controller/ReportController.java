package mth.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import mth.models.Report;
import mth.services.ReportService;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService service;

    @GetMapping("/user/{userId}")
    public List<Report> getReportsByUser(@PathVariable Long userId) {
        return service.getReportsByUser(userId);
    }

    @GetMapping("/user/{userId}/{month}")
    public List<Report> getReportsByUserAndMonth(
            @PathVariable Long userId,
            @PathVariable String month
    ) {
        return service.getReportsByUserAndMonth(userId, month);
    }

    @PostMapping("/save")
    public Report saveReport(@RequestBody Report report) {
        return service.saveReport(report);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteReport(@PathVariable Long id) {
        service.deleteReport(id);
    }
}
