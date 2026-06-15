package mth.services;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import mth.models.Budget;
import mth.repository.BudgetRepository;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository repo;

    public List<Budget> getBudgetsByUser(Long userId) {
        return repo.findByUserId(userId);
    }

    public List<Budget> getBudgetsByUserAndMonth(Long userId, String month) {
        return repo.findByUserIdAndMonth(userId, month);
    }

    public Budget saveOrUpdateBudget(Budget budget) {
        Optional<Budget> existing = repo.findByUserIdAndCategoryAndMonth(
            budget.getUserId(), budget.getCategory(), budget.getMonth()
        );

        if (existing.isPresent()) {
            Budget dbBudget = existing.get();
            dbBudget.setAmount(budget.getAmount());
            if (budget.getSpent() != null) {
                dbBudget.setSpent(budget.getSpent());
            }
            return repo.save(dbBudget);
        }

        return repo.save(budget);
    }

    public void deleteBudget(Long id) {
        repo.deleteById(id);
    }

    public void updateBudgetSpending(Long userId, String category, String month, Double spentAmount) {
        Optional<Budget> existing = repo.findByUserIdAndCategoryAndMonth(userId, category, month);
        if (existing.isPresent()) {
            Budget budget = existing.get();
            budget.setSpent(spentAmount);
            repo.save(budget);
        }
    }
}
