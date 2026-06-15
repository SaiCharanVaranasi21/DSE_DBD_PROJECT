import { useState } from "react";
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import logoImg from "../logo.png";

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:8000";

const Onboarding = ({ userId, onComplete, token, onLogout }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Financial Profile and Survey Data
  const [financialData, setFinancialData] = useState({
    monthlyIncome: "",
    savingsGoal: "",
    housingBudget: "",
    foodBudget: "",
    travelBudget: "",
    utilitiesBudget: "",
    entertainmentBudget: "",
    savingsInvestment: "",
    
    // Step 2 Survey Questions
    occupation: "salaried",
    incomeFrequency: "monthly",
    primaryIncomeSource: "",
    multipleIncomeSources: false,
    topSpendingCategories: "",
    dailyExpenseReminders: false,
    financialGoal: "Save money",
    savingFor: "Emergency Fund",
    billReminders: false,
    dailyExpenseAlerts: false,
    overspendingAlerts: false,
  });

  const categoriesList = ["Housing", "Food", "Transport", "Utilities", "Entertainment", "Savings"];
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleFinancialChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFinancialData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (type === "number" && value !== "" ? parseFloat(value) : value),
    }));
  };

  const toggleCategory = (cat) => {
    let updated;
    if (selectedCategories.includes(cat)) {
      updated = selectedCategories.filter((c) => c !== cat);
    } else {
      updated = [...selectedCategories, cat];
    }
    setSelectedCategories(updated);
    setFinancialData((prev) => ({
      ...prev,
      topSpendingCategories: updated.join(","),
    }));
  };

  const validateStep1 = () => {
    if (!financialData.monthlyIncome) {
      setError("Monthly income is required");
      return false;
    }
    if (!financialData.savingsGoal) {
      setError("Savings goal is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep(1);
  };

  const handleCompleteOnboarding = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Save complete financial profile including survey answers
      const financialResponse = await fetch(
        `${GATEWAY_URL}/financial/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: Number(userId),
            ...financialData,
          }),
        }
      );

      if (!financialResponse.ok) {
        throw new Error("Failed to save financial profile and survey");
      }

      // Mark onboarding as complete in the database
      const completeResponse = await fetch(
        `${GATEWAY_URL}/api/users/${userId}/complete-onboarding`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!completeResponse.ok) {
        throw new Error("Failed to finalize onboarding setup");
      }
      const completeData = await completeResponse.json();
      if (completeData.code !== 200) {
        throw new Error(completeData.message || "Failed to finalize onboarding setup");
      }

      setSuccess("Onboarding completed successfully!");
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-fullscreen-wrapper">
      <div className="setup-card" style={{ maxWidth: step === 1 ? "840px" : "900px", position: "relative" }}>
        
        {onLogout && (
          <div style={{ position: "absolute", top: "24px", right: "24px" }}>
            <button 
              type="button" 
              onClick={onLogout} 
              className="profile-action-toggle-btn"
              style={{ fontSize: "12px", padding: "6px 12px", background: "none", border: "1px solid var(--line)", cursor: "pointer" }}
            >
              Cancel & Logout
            </button>
          </div>
        )}
        
        {/* Step Indicator */}
        <div className="setup-step-indicators">
          <div className={`setup-step-item ${step >= 1 ? "active" : ""}`}>
            <span className="setup-step-number">1</span>
            <span>Financial Limits</span>
          </div>
          <div className={`setup-step-line ${step >= 2 ? "active" : ""}`}></div>
          <div className={`setup-step-item ${step === 2 ? "active" : ""}`}>
            <span className="setup-step-number">2</span>
            <span>Workspace Preferences</span>
          </div>
        </div>

        <div className="setup-header">
          <img src={logoImg} alt="Money GO Logo" className="setup-logo" />
          <h2>{step === 1 ? "Financial Profile Setup" : "Financial Workspace Customization"}</h2>
          <p>
            {step === 1
              ? "Configure your monthly income baseline and spending limits."
              : "Tell us a bit about your goals and setup custom alerts and reminders."}
          </p>
        </div>

        <div className="setup-form">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "16px", padding: "12px", borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fee2e2", fontSize: "14px" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ marginBottom: "16px", padding: "12px", borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center", background: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7", fontSize: "14px" }}>
              <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
              <span>{success}</span>
            </div>
          )}

          {/* STEP 1: FINANCIAL PROFILE BUDGET CAPS */}
          {step === 1 && (
            <>
              <div className="setup-row">
                <div className="setup-field">
                  <label htmlFor="monthlyIncome">What is your current net monthly income? *</label>
                  <input
                    type="number"
                    id="monthlyIncome"
                    name="monthlyIncome"
                    placeholder="e.g. 50000"
                    value={financialData.monthlyIncome}
                    onChange={handleFinancialChange}
                    required
                  />
                </div>

                <div className="setup-field">
                  <label htmlFor="savingsGoal">How much do you intend to save each month? *</label>
                  <input
                    type="number"
                    id="savingsGoal"
                    name="savingsGoal"
                    placeholder="e.g. 10000"
                    value={financialData.savingsGoal}
                    onChange={handleFinancialChange}
                    required
                  />
                </div>
              </div>

              <div className="setup-section-title" style={{ marginTop: "16px", paddingBottom: "8px", borderBottom: "1px dashed #cbd5e1" }}>
                Estimated Limits Across Core Sectors
              </div>

              <div className="setup-row" style={{ marginTop: "12px" }}>
                <div className="setup-field">
                  <label htmlFor="housingBudget">🏠 Housing Budget Cap (Rs.)</label>
                  <input
                    type="number"
                    id="housingBudget"
                    name="housingBudget"
                    placeholder="e.g. 15000"
                    value={financialData.housingBudget}
                    onChange={handleFinancialChange}
                  />
                </div>

                <div className="setup-field">
                  <label htmlFor="foodBudget">🍔 Food & Groceries Budget Cap (Rs.)</label>
                  <input
                    type="number"
                    id="foodBudget"
                    name="foodBudget"
                    placeholder="e.g. 8000"
                    value={financialData.foodBudget}
                    onChange={handleFinancialChange}
                  />
                </div>
              </div>

              <div className="setup-row" style={{ marginTop: "12px" }}>
                <div className="setup-field">
                  <label htmlFor="travelBudget">🚗 Commute & Travel Budget Cap (Rs.)</label>
                  <input
                    type="number"
                    id="travelBudget"
                    name="travelBudget"
                    placeholder="e.g. 4000"
                    value={financialData.travelBudget}
                    onChange={handleFinancialChange}
                  />
                </div>

                <div className="setup-field">
                  <label htmlFor="utilitiesBudget">⚡ Household Utilities Budget Cap (Rs.)</label>
                  <input
                    type="number"
                    id="utilitiesBudget"
                    name="utilitiesBudget"
                    placeholder="e.g. 5000"
                    value={financialData.utilitiesBudget}
                    onChange={handleFinancialChange}
                  />
                </div>
              </div>

              <div className="setup-row" style={{ marginTop: "12px" }}>
                <div className="setup-field">
                  <label htmlFor="entertainmentBudget">🍿 Entertainment Budget Cap (Rs.)</label>
                  <input
                    type="number"
                    id="entertainmentBudget"
                    name="entertainmentBudget"
                    placeholder="e.g. 3000"
                    value={financialData.entertainmentBudget}
                    onChange={handleFinancialChange}
                  />
                </div>

                <div className="setup-field">
                  <label htmlFor="savingsInvestment">💰 Savings & Investments Allocation (Rs.)</label>
                  <input
                    type="number"
                    id="savingsInvestment"
                    name="savingsInvestment"
                    placeholder="e.g. 10000"
                    value={financialData.savingsInvestment}
                    onChange={handleFinancialChange}
                  />
                </div>
              </div>

              <button
                className="setup-submit-btn"
                onClick={handleNextStep}
                style={{ marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                Continue to Survey Preferences <ArrowRight size={18} />
              </button>
            </>
          )}

          {/* STEP 2: SURVEY QUESTIONS */}
          {step === 2 && (
            <>
              <div className="setup-row">
                <div className="setup-field">
                  <label htmlFor="occupation">What is your occupation?</label>
                  <select
                    id="occupation"
                    name="occupation"
                    value={financialData.occupation}
                    onChange={handleFinancialChange}
                  >
                    <option value="student">Student</option>
                    <option value="salaried">Salaried Employee</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="business">Business Owner</option>
                  </select>
                </div>

                <div className="setup-field">
                  <label htmlFor="incomeFrequency">How often do you receive income?</label>
                  <select
                    id="incomeFrequency"
                    name="incomeFrequency"
                    value={financialData.incomeFrequency}
                    onChange={handleFinancialChange}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="irregular">Irregular</option>
                  </select>
                </div>
              </div>

              <div className="setup-row" style={{ marginTop: "12px" }}>
                <div className="setup-field">
                  <label htmlFor="primaryIncomeSource">What is your primary source of income?</label>
                  <input
                    type="text"
                    id="primaryIncomeSource"
                    name="primaryIncomeSource"
                    placeholder="e.g. Salary, Web Development, Rent"
                    value={financialData.primaryIncomeSource}
                    onChange={handleFinancialChange}
                  />
                </div>

                <div className="setup-field">
                  <label htmlFor="multipleIncomeSources">Do you have multiple income sources?</label>
                  <select
                    id="multipleIncomeSources"
                    name="multipleIncomeSources"
                    value={financialData.multipleIncomeSources.toString()}
                    onChange={(e) =>
                      setFinancialData((prev) => ({
                        ...prev,
                        multipleIncomeSources: e.target.value === "true",
                      }))
                    }
                  >
                    <option value="false">No, only one source</option>
                    <option value="true">Yes, multiple sources</option>
                  </select>
                </div>
              </div>

              <div className="setup-row" style={{ marginTop: "12px" }}>
                <div className="setup-field">
                  <label htmlFor="financialGoal">What is your main financial goal?</label>
                  <select
                    id="financialGoal"
                    name="financialGoal"
                    value={financialData.financialGoal}
                    onChange={handleFinancialChange}
                  >
                    <option value="Save money">Save money</option>
                    <option value="Pay off debt">Pay off debt</option>
                    <option value="Build emergency fund">Build emergency fund</option>
                    <option value="Invest">Invest</option>
                    <option value="Control spending">Control spending</option>
                  </select>
                </div>

                <div className="setup-field">
                  <label htmlFor="savingFor">What are you saving for?</label>
                  <select
                    id="savingFor"
                    name="savingFor"
                    value={financialData.savingFor}
                    onChange={handleFinancialChange}
                  >
                    <option value="Car">Car</option>
                    <option value="House">House</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Education">Education</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                  </select>
                </div>
              </div>

              <div className="setup-field" style={{ marginTop: "12px" }}>
                <label>Which categories do you spend most on? (Select all that apply)</label>
                <div className="survey-badges-grid">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`survey-badge ${selectedCategories.includes(cat) ? "active" : ""}`}
                      onClick={() => toggleCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setup-section-title" style={{ marginTop: "20px", paddingBottom: "8px", borderBottom: "1px dashed #cbd5e1" }}>
                Workspace Alert Preferences
              </div>

              <div className="survey-alerts-grid">
                <div
                  className={`survey-alert-card ${financialData.dailyExpenseReminders ? "active" : ""}`}
                  onClick={() =>
                    setFinancialData((prev) => ({
                      ...prev,
                      dailyExpenseReminders: !prev.dailyExpenseReminders,
                    }))
                  }
                >
                  <input
                    type="checkbox"
                    checked={financialData.dailyExpenseReminders}
                    onChange={() => {}} // handled by card click
                  />
                  <div className="survey-alert-card-content">
                    <span className="survey-alert-card-title">Daily Expense Reminders</span>
                    <span className="survey-alert-card-desc">Reminders to log daily expenses</span>
                  </div>
                </div>

                <div
                  className={`survey-alert-card ${financialData.billReminders ? "active" : ""}`}
                  onClick={() =>
                    setFinancialData((prev) => ({
                      ...prev,
                      billReminders: !prev.billReminders,
                    }))
                  }
                >
                  <input
                    type="checkbox"
                    checked={financialData.billReminders}
                    onChange={() => {}}
                  />
                  <div className="survey-alert-card-content">
                    <span className="survey-alert-card-title">Bill Reminders</span>
                    <span className="survey-alert-card-desc">Alerts for upcoming utility bills</span>
                  </div>
                </div>

                <div
                  className={`survey-alert-card ${financialData.dailyExpenseAlerts ? "active" : ""}`}
                  onClick={() =>
                    setFinancialData((prev) => ({
                      ...prev,
                      dailyExpenseAlerts: !prev.dailyExpenseAlerts,
                    }))
                  }
                >
                  <input
                    type="checkbox"
                    checked={financialData.dailyExpenseAlerts}
                    onChange={() => {}}
                  />
                  <div className="survey-alert-card-content">
                    <span className="survey-alert-card-title">Daily Expense Alerts</span>
                    <span className="survey-alert-card-desc">Warning when daily limits are passed</span>
                  </div>
                </div>

                <div
                  className={`survey-alert-card ${financialData.overspendingAlerts ? "active" : ""}`}
                  onClick={() =>
                    setFinancialData((prev) => ({
                      ...prev,
                      overspendingAlerts: !prev.overspendingAlerts,
                    }))
                  }
                >
                  <input
                    type="checkbox"
                    checked={financialData.overspendingAlerts}
                    onChange={() => {}}
                  />
                  <div className="survey-alert-card-content">
                    <span className="survey-alert-card-title">Overspending Alerts</span>
                    <span className="survey-alert-card-desc">Warn if category budget hits 90%</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                <button
                  type="button"
                  className="profile-action-toggle-btn"
                  onClick={handlePrevStep}
                  style={{ flex: 1, height: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <ArrowLeft size={18} /> Back to Budgets
                </button>
                
                <button
                  type="button"
                  className="setup-submit-btn"
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  style={{ flex: 2, marginTop: 0 }}
                >
                  {loading ? "Launching Dashboard..." : "Complete Setup & Launch Dashboard"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
