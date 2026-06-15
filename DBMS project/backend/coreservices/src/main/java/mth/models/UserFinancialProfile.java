package mth.models;

import jakarta.persistence.*;

@Entity
@Table(name = "user_financial_profile")
public class UserFinancialProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Double monthlyIncome;

    private Double savingsGoal;

    private Double housingBudget;

    private Double foodBudget;

    private Double travelBudget;

    private Double utilitiesBudget;

    private Double entertainmentBudget;

    @Column(name = "savings_budget")
    private Double savingsInvestment;

    private String occupation;

    private String incomeFrequency;

    private String primaryIncomeSource;

    private Boolean multipleIncomeSources;

    private String topSpendingCategories;

    private Boolean dailyExpenseReminders;

    private String financialGoal;

    private String savingFor;

    private Boolean billReminders;

    private Boolean dailyExpenseAlerts;

    private Boolean overspendingAlerts;

    // ===== GETTERS AND SETTERS =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(Double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public Double getSavingsGoal() {
        return savingsGoal;
    }

    public void setSavingsGoal(Double savingsGoal) {
        this.savingsGoal = savingsGoal;
    }

    public Double getHousingBudget() {
        return housingBudget;
    }

    public void setHousingBudget(Double housingBudget) {
        this.housingBudget = housingBudget;
    }

    public Double getFoodBudget() {
        return foodBudget;
    }

    public void setFoodBudget(Double foodBudget) {
        this.foodBudget = foodBudget;
    }

    public Double getTravelBudget() {
        return travelBudget;
    }

    public void setTravelBudget(Double travelBudget) {
        this.travelBudget = travelBudget;
    }

    public Double getUtilitiesBudget() {
        return utilitiesBudget;
    }

    public void setUtilitiesBudget(Double utilitiesBudget) {
        this.utilitiesBudget = utilitiesBudget;
    }

    public Double getEntertainmentBudget() {
        return entertainmentBudget;
    }

    public void setEntertainmentBudget(Double entertainmentBudget) {
        this.entertainmentBudget = entertainmentBudget;
    }

    public Double getSavingsInvestment() {
        return savingsInvestment;
    }

    public void setSavingsInvestment(Double savingsInvestment) {
        this.savingsInvestment = savingsInvestment;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public String getIncomeFrequency() {
        return incomeFrequency;
    }

    public void setIncomeFrequency(String incomeFrequency) {
        this.incomeFrequency = incomeFrequency;
    }

    public String getPrimaryIncomeSource() {
        return primaryIncomeSource;
    }

    public void setPrimaryIncomeSource(String primaryIncomeSource) {
        this.primaryIncomeSource = primaryIncomeSource;
    }

    public Boolean getMultipleIncomeSources() {
        return multipleIncomeSources;
    }

    public void setMultipleIncomeSources(Boolean multipleIncomeSources) {
        this.multipleIncomeSources = multipleIncomeSources;
    }

    public String getTopSpendingCategories() {
        return topSpendingCategories;
    }

    public void setTopSpendingCategories(String topSpendingCategories) {
        this.topSpendingCategories = topSpendingCategories;
    }

    public Boolean getDailyExpenseReminders() {
        return dailyExpenseReminders;
    }

    public void setDailyExpenseReminders(Boolean dailyExpenseReminders) {
        this.dailyExpenseReminders = dailyExpenseReminders;
    }

    public String getFinancialGoal() {
        return financialGoal;
    }

    public void setFinancialGoal(String financialGoal) {
        this.financialGoal = financialGoal;
    }

    public String getSavingFor() {
        return savingFor;
    }

    public void setSavingFor(String savingFor) {
        this.savingFor = savingFor;
    }

    public Boolean getBillReminders() {
        return billReminders;
    }

    public void setBillReminders(Boolean billReminders) {
        this.billReminders = billReminders;
    }

    public Boolean getDailyExpenseAlerts() {
        return dailyExpenseAlerts;
    }

    public void setDailyExpenseAlerts(Boolean dailyExpenseAlerts) {
        this.dailyExpenseAlerts = dailyExpenseAlerts;
    }

    public Boolean getOverspendingAlerts() {
        return overspendingAlerts;
    }

    public void setOverspendingAlerts(Boolean overspendingAlerts) {
        this.overspendingAlerts = overspendingAlerts;
    }
}