package mth.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import mth.models.Budget;
import mth.services.BudgetService;

@RestController
@RequestMapping("/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService service;

    @GetMapping("/user/{userId}")
    public List<Budget> getBudgetsByUser(@PathVariable Long userId) {
        return service.getBudgetsByUser(userId);
    }

    @GetMapping("/user/{userId}/{month}")
    public List<Budget> getBudgetsByUserAndMonth(
            @PathVariable Long userId,
            @PathVariable String month
    ) {
        return service.getBudgetsByUserAndMonth(userId, month);
    }

    @PostMapping("/save")
    public Budget saveBudget(@RequestBody Budget budget) {
        return service.saveOrUpdateBudget(budget);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteBudget(@PathVariable Long id) {
        service.deleteBudget(id);
    }
}
