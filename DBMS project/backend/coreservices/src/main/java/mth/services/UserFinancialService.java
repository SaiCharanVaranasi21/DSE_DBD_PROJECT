package mth.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.UserFinancialProfile;
import mth.repository.UserFinancialRepository;

@Service
public class UserFinancialService {

    @Autowired
    private UserFinancialRepository repo;

    // SAVE OR UPDATE PROFILE
    public UserFinancialProfile saveProfile(
            UserFinancialProfile profile
    ) {

        Optional<UserFinancialProfile> existing =
                repo.findByUserId(profile.getUserId());

        // UPDATE EXISTING PROFILE
        if(existing.isPresent()) {

            UserFinancialProfile db = existing.get();

            db.setMonthlyIncome(profile.getMonthlyIncome());

            db.setSavingsGoal(profile.getSavingsGoal());

            db.setHousingBudget(profile.getHousingBudget());

            db.setFoodBudget(profile.getFoodBudget());

            db.setTravelBudget(profile.getTravelBudget());

            db.setUtilitiesBudget(profile.getUtilitiesBudget());

            db.setEntertainmentBudget(
                    profile.getEntertainmentBudget()
            );

            db.setSavingsInvestment(
                    profile.getSavingsInvestment()
            );

            db.setOccupation(profile.getOccupation());
            db.setIncomeFrequency(profile.getIncomeFrequency());
            db.setPrimaryIncomeSource(profile.getPrimaryIncomeSource());
            db.setMultipleIncomeSources(profile.getMultipleIncomeSources());
            db.setTopSpendingCategories(profile.getTopSpendingCategories());
            db.setDailyExpenseReminders(profile.getDailyExpenseReminders());
            db.setFinancialGoal(profile.getFinancialGoal());
            db.setSavingFor(profile.getSavingFor());
            db.setBillReminders(profile.getBillReminders());
            db.setDailyExpenseAlerts(profile.getDailyExpenseAlerts());
            db.setOverspendingAlerts(profile.getOverspendingAlerts());

            return repo.save(db);
        }

        // SAVE NEW PROFILE
        return repo.save(profile);
    }

    // GET PROFILE
    public UserFinancialProfile getProfile(
            Long userId
    ) {

        return repo.findByUserId(userId)
                .orElse(null);
    }
}