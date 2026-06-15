import { useState, useEffect } from "react";
import "./App.css";
import Onboarding from "./assets/components/Onboarding.jsx";

import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  PiggyBank, 
  LogOut,
  Users, 
  DollarSign, 
  AlertCircle,
  Settings, 
  Database, 
  Activity, 
  Server, 
  CheckCircle,
  BarChart2,
  List,
  User,
  Eye,
  EyeOff,
  Shield,
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Bell,
  Folder,
  FileSpreadsheet
} from 'lucide-react';

import logoImg from "./assets/logo.png";
import savingsImg from "./assets/savings.png";

const GATEWAY_URL = "http://localhost:8000";

const money = (value) => `Rs. ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const roleMeta = {
  1: {
    title: "User Dashboard",
    eyebrow: "Personal finance",
    heading: "Your money command center",
    copy: "Track balances, spending movement, and savings habits from one calm workspace.",
    navigation: [
      { name: "Overview", icon: Activity },
      { name: "Transactions", icon: List },
      { name: "Add Transaction", icon: Plus },
      { name: "Categories", icon: Folder },
      { name: "Budgets", icon: Wallet },
      { name: "Reports & Analytics", icon: BarChart2 },
      { name: "Goals & Savings", icon: PiggyBank },
      { name: "Notifications", icon: Bell },
      { name: "Export Data", icon: FileSpreadsheet },
      { name: "Profile", icon: User },
      { name: "Settings", icon: Settings },
      { name: "Calendar", icon: Calendar },
      { name: "Accounts", icon: CreditCard },
      { name: "Bills & Subscriptions", icon: FileText }
    ]
  },
  2: {
    title: "Admin Dashboard",
    eyebrow: "Platform operations",
    heading: "System control room",
    copy: "Monitor users, infrastructure health, storage pressure, and security alerts.",
    navigation: [
      { name: "System Overview", icon: Activity },
      { name: "User Management", icon: Users },
      { name: "Category Management", icon: Folder },
      { name: "System Reports", icon: BarChart2 },
      { name: "Audit Logs", icon: List },
      { name: "Database Control", icon: Database },
      { name: "Infrastructure", icon: Server }
    ]
  },
  3: {
    title: "Manager Dashboard",
    eyebrow: "Team finance",
    heading: "Approvals and budget flow",
    copy: "Review requests, compare team budgets, and keep spending decisions moving.",
    navigation: [
      { name: "Manager Pulse", icon: Activity },
      { name: "Team Overview", icon: Users },
      { name: "Budget Requests", icon: DollarSign },
      { name: "Pending Alerts", icon: AlertCircle }
    ]
  },
};

const StatCard = ({ icon: Icon, label, value, note, tone = "teal", trend }) => (
  <div className="stats-card">
    <div className="card-header">
      <div className={`icon-wrapper bg-${tone}-light`}>
        <Icon className={`icon-md text-${tone}`} />
      </div>
      {trend && <span className={`trend-tag ${trend.includes("-") ? "trend-down" : "trend-up"}`}>{trend}</span>}
    </div>
    <p className="card-label">{label}</p>
    <p className="card-value">{value}</p>
    {note && <p className="card-note">{note}</p>}
  </div>
);

// --- UI Language Translation Dictionary ---
const translations = {
  English: {
    Overview: "Overview",
    Transactions: "Transactions",
    "Add Transaction": "Add Transaction",
    Categories: "Categories",
    Budgets: "Budgets",
    "Reports & Analytics": "Reports & Analytics",
    "Goals & Savings": "Goals & Savings",
    Notifications: "Notifications",
    "Export Data": "Export Data",
    Profile: "Profile",
    Settings: "Settings",
    Calendar: "Calendar",
    Accounts: "Accounts",
    "Bills & Subscriptions": "Bills & Subscriptions"
  },
  Telugu: {
    Overview: "అవలోకనం",
    Transactions: "లావాదేవీలు",
    "Add Transaction": "లావాదేవీని జోడించు",
    Categories: "విభాగాలు",
    Budgets: "బడ్జెట్లు",
    "Reports & Analytics": "నివేదికలు & విశ్లేషణలు",
    "Goals & Savings": "లక్ష్యాలు & పొదుపులు",
    Notifications: "నోటిఫికేషన్లు",
    "Export Data": "డేటాను ఎగుమతి చేయి",
    Profile: "ప్రొఫైల్",
    Settings: "సెట్టింగులు",
    Calendar: "క్యాలెండర్",
    Accounts: "ఖాతాలు",
    "Bills & Subscriptions": "బిల్లులు & చందాలు"
  },
  Hindi: {
    Overview: "अवलोकन",
    Transactions: "लेन-देन",
    "Add Transaction": "लेन-देन जोड़ें",
    Categories: "श्रेणियाँ",
    Budgets: "बजट",
    "Reports & Analytics": "रिपोर्ट और विश्लेषण",
    "Goals & Savings": "लक्ष्य और बचत",
    Notifications: "सूचनाएं",
    "Export Data": "डेटा निर्यात",
    Profile: "प्रोफ़ाइल",
    Settings: "सेटिंग्स",
    Calendar: "कैलेंडर",
    Accounts: "खाते",
    "Bills & Subscriptions": "बिल और सदस्यता"
  }
};

export function App({ initialPage = "signin" }) {
  // Authentication States
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("jwtToken"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [userName, setUserName] = useState(localStorage.getItem("fullname"));
  const [userData, setUserData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Settings & Customizations (Locale & Layout)
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem("selectedLanguage") || "English");
  const [accessibilityFontSize, setAccessibilityFontSize] = useState(() => localStorage.getItem("accessibilityFontSize") || "medium");
  const [accessibilityCompactMode, setAccessibilityCompactMode] = useState(() => localStorage.getItem("accessibilityCompactMode") === "true");
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem("emailAlerts") !== "false");
  const [pushNotifications, setPushNotifications] = useState(() => localStorage.getItem("pushNotifications") === "true");
  const [sessionTimeoutVal, setSessionTimeoutVal] = useState(() => localStorage.getItem("sessionTimeoutVal") || "15 min");

  // Dynamic Money Formatter overriding global
  const formatMoney = (value) => {
    const num = Number(value);
    const curr = profileCurrency || currency || "INR";
    if (curr === "USD") {
      return `$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (curr === "EUR") {
      return `€ ${num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const money = formatMoney;

  // Real Accounts State (Cash Wallet, Bank Account, Credit Card, UPI Account)
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem("money_manager_accounts");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: "cash", name: "Cash Wallet", balance: 15000, type: "cash", number: "CASH-WALLET" },
      { id: "bank", name: "Bank Account", balance: 50000, type: "bank", number: "HDFC-••••3920" },
      { id: "credit", name: "Credit Card", balance: -5000, type: "credit", number: "SBI-••••8472" },
      { id: "upi", name: "UPI Account", balance: 8000, type: "upi", number: "upi@paytm" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("money_manager_accounts", JSON.stringify(accounts));
  }, [accounts]);

  // Real Bills & Subscriptions State (Netflix, Spotify, Rent, Electricity Bill, Internet Bill)
  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem("money_manager_bills");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: "Netflix", amount: 649, category: "Entertainment", dueDate: "2026-06-20", paymentMethod: "Credit Card", status: "unpaid" },
      { id: 2, name: "Spotify", amount: 119, category: "Entertainment", dueDate: "2026-06-25", paymentMethod: "UPI Account", status: "unpaid" },
      { id: 3, name: "Electricity Bill", amount: 2200, category: "Utilities", dueDate: "2026-06-18", paymentMethod: "Bank Account", status: "unpaid" },
      { id: 4, name: "Internet Bill", amount: 799, category: "Utilities", dueDate: "2026-06-15", paymentMethod: "UPI Account", status: "unpaid" },
      { id: 5, name: "Rent", amount: 12000, category: "Housing", dueDate: "2026-07-01", paymentMethod: "Bank Account", status: "unpaid" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("money_manager_bills", JSON.stringify(bills));
  }, [bills]);

  // Recurring Bills & Subscription Management State
  const [recurringBills, setRecurringBills] = useState(() => {
    const saved = localStorage.getItem("money_manager_recurring_bills");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: "Netflix", frequency: "Monthly", amount: 649, nextDate: "2026-07-20", active: true },
      { id: 2, name: "Gym Membership", frequency: "Monthly", amount: 999, nextDate: "2026-07-01", active: true },
      { id: 3, name: "Internet", frequency: "Monthly", amount: 799, nextDate: "2026-06-15", active: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem("money_manager_recurring_bills", JSON.stringify(recurringBills));
  }, [recurringBills]);

  // Payment History State
  const [paymentHistory, setPaymentHistory] = useState(() => {
    const saved = localStorage.getItem("money_manager_payment_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, billName: "Netflix", amount: 649, paidDate: "2026-05-20", method: "Credit Card", status: "completed" },
      { id: 2, billName: "Electricity", amount: 2200, paidDate: "2026-05-18", method: "Bank Transfer", status: "completed" },
      { id: 3, billName: "Internet", amount: 799, paidDate: "2026-05-15", method: "UPI", status: "completed" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("money_manager_payment_history", JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  // Account Statements State
  const [accountStatements, setAccountStatements] = useState(() => {
    const saved = localStorage.getItem("money_manager_statements");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      cash: [
        { date: "2026-06-01", description: "Cash Withdrawal", amount: -5000, balance: 10000 },
        { date: "2026-06-05", description: "Freelance Income", amount: 8000, balance: 18000 }
      ],
      bank: [
        { date: "2026-06-01", description: "Salary Credit", amount: 50000, balance: 100000 },
        { date: "2026-06-10", description: "Bill Payment", amount: -2200, balance: 97800 }
      ],
      credit: [
        { date: "2026-06-01", description: "Online Shopping", amount: -3000, balance: -3000 },
        { date: "2026-06-15", description: "Bill Payment", amount: -2000, balance: -5000 }
      ],
      upi: [
        { date: "2026-06-01", description: "UPI Transfer", amount: 5000, balance: 13000 },
        { date: "2026-06-05", description: "Bill Payment", amount: -799, balance: 12201 }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem("money_manager_statements", JSON.stringify(accountStatements));
  }, [accountStatements]);

  // Change Password States
  const [currentPasswordVal, setCurrentPasswordVal] = useState("");
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [confirmNewPasswordVal, setConfirmNewPasswordVal] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Recent Activity Timeline State
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, action: "User session initialized", timestamp: new Date(Date.now() - 3600000) },
    { id: 2, action: "Fetched core profile metadata", timestamp: new Date(Date.now() - 1800000) }
  ]);

  const appendActivity = (actionText) => {
    setActivityLogs(prev => [
      { id: Date.now() + Math.random(), action: actionText, timestamp: new Date() },
      ...prev
    ]);
  };

  // --- Dynamic Categories State ---
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("money_manager_categories");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: "Housing", type: "expense" },
      { id: 2, name: "Food", type: "expense" },
      { id: 3, name: "Transport", type: "expense" },
      { id: 4, name: "Utilities", type: "expense" },
      { id: 5, name: "Entertainment", type: "expense" },
      { id: 6, name: "Savings", type: "expense" },
      { id: 7, name: "Salary", type: "income" },
      { id: 8, name: "Freelance", type: "income" },
      { id: 9, name: "Shopping", type: "expense" },
      { id: 10, name: "Bills", type: "expense" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("money_manager_categories", JSON.stringify(categories));
  }, [categories]);

  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("expense");
  const [newCatColor, setNewCatColor] = useState("#4f46e5");
  const [newCatIcon, setNewCatIcon] = useState("🛍️");

  // --- Top-level states for Calendar, Accounts, Bills tabs ---
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("cash");
  const [transferSource, setTransferSource] = useState("cash");
  const [transferDest, setTransferDest] = useState("bank");
  const [transferAmount, setTransferAmount] = useState("");
  const [billsTabSelected, setBillsTabSelected] = useState("upcomingBills");
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billCategory, setBillCategory] = useState("Utilities");
  const [billDate, setBillDate] = useState("");
  const [billAccount, setBillAccount] = useState("Bank Account");

  // --- Savings & Goals State ---
  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem("money_manager_goals");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: "Emergency Fund", target: 50000, current: 15000, deadline: "2026-12-31" },
      { id: 2, name: "New Laptop", target: 80000, current: 35000, deadline: "2026-09-30" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("money_manager_goals", JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");

  // --- Notifications State ---
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Budget Warning", message: "Your Food & Groceries spending has passed 85% of your set limit.", date: new Date(), read: false },
    { id: 2, title: "Monthly Statement Compiled", message: "Your spending reports for the current cycle are compiled.", date: new Date(Date.now() - 86400000), read: true },
    { id: 3, title: "Login Session Audit", message: "Successful system access from IP 127.0.0.1.", date: new Date(Date.now() - 172800000), read: true }
  ]);

  // --- Extra Settings State ---
  const [budgetCycle, setBudgetCycle] = useState(() => localStorage.getItem("money_manager_budget_cycle") || "monthly");
  useEffect(() => {
    localStorage.setItem("money_manager_budget_cycle", budgetCycle);
  }, [budgetCycle]);

  const [savingsHistory, setSavingsHistory] = useState(() => {
    const saved = localStorage.getItem("money_manager_savings_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, goalName: "Emergency Fund", amount: 5000, date: new Date(Date.now() - 4 * 86400000).toISOString() },
      { id: 2, goalName: "New Laptop", amount: 10000, date: new Date(Date.now() - 2 * 86400000).toISOString() }
    ];
  });
  useEffect(() => {
    localStorage.setItem("money_manager_savings_history", JSON.stringify(savingsHistory));
  }, [savingsHistory]);

  const [editingCatId, setEditingCatId] = useState(null);

  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportType, setExportType] = useState("");
  const [exportCategory, setExportCategory] = useState("");

  // --- Admin Dialog & Form CRUD States ---
  const [showAdminUserModal, setShowAdminUserModal] = useState(false);
  const [adminUserEditMode, setAdminUserEditMode] = useState(false);
  const [adminEditingUserId, setAdminEditingUserId] = useState(null);
  const [adminFullname, setAdminFullname] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRoleVal, setAdminRoleVal] = useState("1");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminDob, setAdminDob] = useState("");
  
  // Custom Toasts State
  const [toasts, setToasts] = useState([]);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("1");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Onboarding profile form states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [currency, setCurrency] = useState("INR");

  // Dashboard Tab State
  const [activeTab, setActiveTab] = useState(0);

  // Transactions State
  const [userTransactions, setUserTransactions] = useState([]);
  const [transactionsTotalCount, setTransactionsTotalCount] = useState(0);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsLimit, setTransactionsLimit] = useState(10);
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(1);
  
  // Transaction Query Filters
  const [txnSearch, setTxnSearch] = useState("");
  const [txnTypeFilter, setTxnTypeFilter] = useState("");
  const [txnCategoryFilter, setTxnCategoryFilter] = useState("");
  const [txnSortBy, setTxnSortBy] = useState("date");
  const [txnSortOrder, setTxnSortOrder] = useState("desc");
  const [txnStartDate, setTxnStartDate] = useState("");
  const [txnEndDate, setTxnEndDate] = useState("");

  // Add/Edit transaction dialog state
  const [logExpenseName, setLogExpenseName] = useState("");
  const [logExpenseAmount, setLogExpenseAmount] = useState("");
  const [logExpenseCategory, setLogExpenseCategory] = useState("Food");
  const [logTransactionType, setLogTransactionType] = useState("expense");
  const [logExpenseDate, setLogExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [logPaymentMethod, setLogPaymentMethod] = useState("Cash Wallet");
  const [logNotes, setLogNotes] = useState("");
  const [logRecurring, setLogRecurring] = useState(false);
  const [logReceiptImage, setLogReceiptImage] = useState(null);
  
  // Edit Mode state
  const [editingTxnId, setEditingTxnId] = useState(null);
  const [showTxnModal, setShowTxnModal] = useState(false);

  // Budget States
  const [housingExpense, setHousingExpense] = useState(15000);
  const [foodExpense, setFoodExpense] = useState(8000);
  const [travelExpense, setTravelExpense] = useState(4000);
  const [utilitiesExpense, setUtilitiesExpense] = useState(5000);
  const [entertainmentExpense, setEntertainmentExpense] = useState(3000);
  const [savingsExpense, setSavingsExpense] = useState(10000);
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [targetSavingsGoal, setTargetSavingsGoal] = useState(10000);
  
  // Budget DB entries list
  const [dbBudgetsList, setDbBudgetsList] = useState([]);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Profile Edit States
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileCurrency, setProfileCurrency] = useState("INR");
  const [profileEmail, setProfileEmail] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Settings States
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [themeMode, setThemeMode] = useState("light");

  // Survey Preferences States
  const [occupation, setOccupation] = useState("salaried");
  const [incomeFrequency, setIncomeFrequency] = useState("monthly");
  const [primaryIncomeSource, setPrimaryIncomeSource] = useState("");
  const [multipleIncomeSources, setMultipleIncomeSources] = useState(false);
  const [topSpendingCategories, setTopSpendingCategories] = useState("");
  const [dailyExpenseReminders, setDailyExpenseReminders] = useState(false);
  const [financialGoal, setFinancialGoal] = useState("Save money");
  const [savingFor, setSavingFor] = useState("Emergency Fund");
  const [billReminders, setBillReminders] = useState(false);
  const [dailyExpenseAlerts, setDailyExpenseAlerts] = useState(false);
  const [overspendingAlerts, setOverspendingAlerts] = useState(false);

  // Admin & Manager dashboard states
  const [allUsersList, setAllUsersList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [managerBudgetRequests, setManagerBudgetRequests] = useState([
    { id: 1, name: "Amit Sharma", category: "Transport", amount: 5000, reason: "Client travel expenses", status: "Pending" },
    { id: 2, name: "Priya Patel", category: "Entertainment", amount: 3000, reason: "Team lunch hosting", status: "Pending" },
    { id: 3, name: "Sneha Reddy", category: "Utilities", amount: 8000, reason: "Backup power diagnostics", status: "Pending" },
  ]);

  // Admin MongoDB Collections States
  const [dbSubTab, setDbSubTab] = useState("postgres"); // "postgres" or "mongodb"
  const [mongoSelectedCollection, setMongoSelectedCollection] = useState("expense_logs"); // "expense_logs", "expense_embeddings", "user_activity"
  const [mongoCollectionData, setMongoCollectionData] = useState([]);
  const [mongoLoading, setMongoLoading] = useState(false);
  const [mongoSearch, setMongoSearch] = useState("");
  const [selectedMongoDoc, setSelectedMongoDoc] = useState(null);

  const fetchMongoCollectionData = async (collectionName) => {
    try {
      setMongoLoading(true);
      const target = collectionName || mongoSelectedCollection;
      const response = await fetch(`${GATEWAY_URL}/api/admin/mongo/${target}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMongoCollectionData(data.data || []);
      } else {
        showToast(`Failed to fetch MongoDB collection: ${target}`, "error");
        setMongoCollectionData([]);
      }
    } catch (err) {
      console.error(err);
      showToast("Network error fetching MongoDB collections data.", "error");
      setMongoCollectionData([]);
    } finally {
      setMongoLoading(false);
    }
  };

  // Helper: Trigger custom Toast banner alerts
  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Synchronize backend data with local states
  useEffect(() => {
    if (financialData) {
      setMonthlyIncome(financialData.monthlyIncome || 50000);
      setTargetSavingsGoal(financialData.savingsGoal || 10000);
      setHousingExpense(financialData.housingBudget || 15000);
      setFoodExpense(financialData.foodBudget || 8000);
      setTravelExpense(financialData.travelBudget || 4000);
      setUtilitiesExpense(financialData.utilitiesBudget || 5000);
      setEntertainmentExpense(financialData.entertainmentBudget || 3000);
      setSavingsExpense(financialData.savingsInvestment || 10000);

      // Sync survey data
      setOccupation(financialData.occupation || "salaried");
      setIncomeFrequency(financialData.incomeFrequency || "monthly");
      setPrimaryIncomeSource(financialData.primaryIncomeSource || "");
      setMultipleIncomeSources(financialData.multipleIncomeSources ?? false);
      setTopSpendingCategories(financialData.topSpendingCategories || "");
      setDailyExpenseReminders(financialData.dailyExpenseReminders ?? false);
      setFinancialGoal(financialData.financialGoal || "Save money");
      setSavingFor(financialData.savingFor || "Emergency Fund");
      setBillReminders(financialData.billReminders ?? false);
      setDailyExpenseAlerts(financialData.dailyExpenseAlerts ?? false);
      setOverspendingAlerts(financialData.overspendingAlerts ?? false);
    }
  }, [financialData]);

  useEffect(() => {
    if (userData) {
      setProfileName(userData.fullname || "");
      setProfilePhone(userData.phone || "");
      setProfileDob(userData.dateOfBirth || "");
      setProfileCurrency(userData.preferredCurrency || "INR");
      setProfileEmail(userData.email || "");
    }
  }, [userData]);

  // Apply dark mode skin dynamically to document body
  useEffect(() => {
    if (themeMode === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [themeMode]);

  // Dynamic Alert Generation Hook
  useEffect(() => {
    if (!isLoggedIn || Number(userRole) !== 1) return;
    
    const newAlerts = [];

    // 1. Budget warnings
    categories.forEach(c => {
      const budgetLimit = c.name === "Housing" ? housingExpense :
                          c.name === "Food" ? foodExpense :
                          c.name === "Transport" ? travelExpense :
                          c.name === "Utilities" ? utilitiesExpense :
                          c.name === "Entertainment" ? entertainmentExpense :
                          c.name === "Savings" ? savingsExpense : 0;
      const spent = dbBudgetsList.find(b => b.category === c.name)?.spent || 0;
      if (budgetLimit > 0 && spent >= 0.9 * budgetLimit) {
        const title = `Budget Warning: ${c.name}`;
        const message = `Your spending in ${c.name} (${money(spent)}) has reached 90%+ of your limit of ${money(budgetLimit)}.`;
        // Check if already in notifications
        if (!notifications.some(n => n.title === title)) {
          newAlerts.push({ id: Date.now() + Math.random(), title, message, date: new Date(), read: false });
        }
      }
    });

    // 2. Low balance warnings
    accounts.forEach(acc => {
      if (acc.type !== "credit" && acc.balance < 2000) {
        const title = `Low Balance: ${acc.name}`;
        const message = `Your ${acc.name} balance is critically low: ${money(acc.balance)}`;
        if (!notifications.some(n => n.title === title)) {
          newAlerts.push({ id: Date.now() + Math.random(), title, message, date: new Date(), read: false });
        }
      }
    });

    // 3. Due subscription warnings
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    bills.forEach(bill => {
      if (bill.status === "unpaid") {
        const billDue = new Date(bill.dueDate);
        if (billDue <= threeDaysFromNow) {
          const title = `Subscription Due: ${bill.name}`;
          const message = `Your subscription for ${bill.name} (${money(bill.amount)}) is due on ${new Date(bill.dueDate).toLocaleDateString()}.`;
          if (!notifications.some(n => n.title === title)) {
            newAlerts.push({ id: Date.now() + Math.random(), title, message, date: new Date(), read: false });
          }
        }
      }
    });

    if (newAlerts.length > 0) {
      setNotifications(prev => [...newAlerts, ...prev]);
    }
  }, [dbBudgetsList, accounts, bills, isLoggedIn, userRole]);

  // Load initial data if already logged in
  useEffect(() => {
    if (token && userId) {
      setIsLoggedIn(true);
      fetchUserData();
      // Fetch financial and transactions data for regular users (role 1)
      if (Number(userRole) === 1) {
        fetchFinancialData();
        fetchTransactions();
        fetchBudgetsList();
      }
      // Fetch all users for admins (role 2)
      if (Number(userRole) === 2) {
        fetchAllUsers(token);
      }
    }
  }, [token, userId, userRole]);

  // Re-fetch transactions on filter changes
  useEffect(() => {
    if (isLoggedIn && Number(userRole) === 1) {
      fetchTransactions();
    }
  }, [transactionsPage, transactionsLimit, txnTypeFilter, txnCategoryFilter, txnSortBy, txnSortOrder, txnStartDate, txnEndDate]);

  // Trigger search on delay
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (isLoggedIn && Number(userRole) === 1) {
        fetchTransactions();
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [txnSearch]);

  // Re-fetch MongoDB collection data for Admin when database tab is active
  useEffect(() => {
    if (isLoggedIn && Number(userRole) === 2 && activeTab === 5 && dbSubTab === "mongodb") {
      fetchMongoCollectionData();
    }
  }, [isLoggedIn, userRole, activeTab, dbSubTab, mongoSelectedCollection]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${GATEWAY_URL}/api/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setUserData(data.data);
        if (data.data.firstLogin && Number(data.data.role) === 1) {
          setShowOnboarding(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const response = await fetch(`${GATEWAY_URL}/financial/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      const data = await response.json();
      if (data) {
        setFinancialData(data);
      }
    } catch (err) {
      console.error("Failed to fetch financial data:", err);
    }
  };

  const fetchBudgetsList = async () => {
    try {
      const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2026-06"
      const response = await fetch(`${GATEWAY_URL}/api/budgets/user/${userId}/${currentMonthStr}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDbBudgetsList(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch db budgets list:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let queryStr = `userId=${userId}&page=${transactionsPage}&limit=${transactionsLimit}&sortBy=${txnSortBy}&sortOrder=${txnSortOrder}`;
      
      if (txnSearch) queryStr += `&search=${encodeURIComponent(txnSearch)}`;
      if (txnTypeFilter) queryStr += `&type=${txnTypeFilter}`;
      if (txnCategoryFilter) queryStr += `&category=${txnCategoryFilter}`;
      if (txnStartDate) queryStr += `&startDate=${txnStartDate}`;
      if (txnEndDate) queryStr += `&endDate=${txnEndDate}`;

      const response = await fetch(`${GATEWAY_URL}/api/transactions?${queryStr}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserTransactions(data.data || []);
        setTransactionsTotalCount(data.total || 0);
        setTransactionsTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      showToast("Could not retrieve transaction logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async (customToken) => {
    const activeToken = customToken || token;
    if (!activeToken) return;
    try {
      setLoading(true);
      const response = await fetch(`${GATEWAY_URL}/api/users`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      const data = await response.json();
      if (data.code === 200 && data.data) {
        setAllUsersList(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch all users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCreateUser = async (e) => {
    e.preventDefault();
    if (!adminFullname || !adminEmail || !adminPassword) {
      showToast("Please provide full name, email, and password.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${GATEWAY_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: adminFullname,
          email: adminEmail,
          password: adminPassword,
          role: Number(adminRoleVal),
          phone: adminPhone || "+91 9999999999",
          dateOfBirth: adminDob || "2000-01-01",
          preferredCurrency: "INR"
        }),
      });
      const data = await response.json();
      if (response.ok && data.code === 200) {
        showToast(`User account "${adminFullname}" successfully created!`);
        appendActivity(`Admin created user: "${adminFullname}" (Role: ${adminRoleVal === "2" ? 'Admin' : adminRoleVal === "3" ? 'Manager' : 'User'})`);
        setShowAdminUserModal(false);
        setAdminFullname("");
        setAdminEmail("");
        setAdminPassword("");
        setAdminRoleVal("1");
        setAdminPhone("");
        setAdminDob("");
        fetchAllUsers();
      } else {
        showToast(data.message || "Failed to create user account.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error creating user.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDeleteUser = async (id, fullname) => {
    if (!confirm(`Are you sure you want to permanently delete user "${fullname}"?`)) return;
    try {
      setLoading(true);
      const response = await fetch(`${GATEWAY_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        showToast(`User "${fullname}" deleted successfully.`);
        appendActivity(`Admin deleted user account: "${fullname}" (ID: USR-${id})`);
        fetchAllUsers();
      } else {
        showToast("Failed to delete user.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error deleting user.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactionsForExport = async () => {
    try {
      setLoading(true);
      let queryStr = `userId=${userId}&page=1&limit=10000&sortBy=date&sortOrder=desc`;
      const response = await fetch(`${GATEWAY_URL}/api/transactions?${queryStr}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) return [];
      const data = await response.json();
      const allTxns = data.data || [];
      
      return allTxns.filter(t => {
        const dateMatch = (!exportStartDate || new Date(t.date) >= new Date(exportStartDate)) &&
                          (!exportEndDate || new Date(t.date) <= new Date(exportEndDate));
        const typeMatch = !exportType || t.type === exportType;
        const categoryMatch = !exportCategory || t.category === exportCategory;
        return dateMatch && typeMatch && categoryMatch;
      });
    } catch (e) {
      console.error(e);
      showToast("Failed to retrieve statement records.", "error");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    const txns = await getFilteredTransactionsForExport();
    if (txns.length === 0) {
      showToast("No transaction records match active filters.", "error");
      return;
    }
    const headers = ["ID", "Name/Description", "Category", "Date", "Type", "Amount"];
    const rows = txns.map(t => [
      t._id || t.id,
      t.description || t.name,
      t.category,
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.amount
    ]);
    
    let xlsContent = headers.join("\t") + "\n" + rows.map(e => e.join("\t")).join("\n");
    const blob = new Blob([xlsContent], { type: "application/vnd.ms-excel;charset=utf-8" });
    const encodedUri = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MoneyManager_Statement_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Statement Excel export download initialized.");
    appendActivity("Exported statement data to Excel (.xls)");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }
    if (!acceptTerms) {
      showToast("Please agree to the Terms & Conditions", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${GATEWAY_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: fullName,
          email,
          password,
          role: Number(role),
          phone: phoneNumber,
          dateOfBirth: dob,
          preferredCurrency: currency
        }),
      });
      const data = await response.json();
      if (response.ok && data.code === 200) {
        showToast("Account successfully created! Redirecting to login...");
        setTimeout(() => {
          setCurrentPage("signin");
          // Reset Form
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFullName("");
          setRole("1");
          setPhoneNumber("");
          setDob("");
          setCurrency("INR");
        }, 1500);
      } else {
        showToast(data.message || "Registration failed", "error");
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      showToast("Server connection error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${GATEWAY_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });
      const data = await response.json();

      if (response.ok && data.jwt) {
        // Localstorage Cache
        localStorage.setItem("jwtToken", data.jwt);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("fullname", data.fullname);

        setToken(data.jwt);
        setUserId(data.userId);
        setUserRole(data.role);
        setUserName(data.fullname);
        setIsLoggedIn(true);

        showToast(`Welcome back, ${data.fullname}!`);
        appendActivity(`Logged in as ${data.fullname} (Role: ${data.role === 2 ? 'Admin' : data.role === 3 ? 'Manager' : 'User'})`);
        
        // Reset login form inputs
        setEmail("");
        setPassword("");
      } else {
        showToast(data.message || "Invalid authentication credentials.", "error");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      showToast("Connection failed to API Gateway.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("fullname");
    setToken(null);
    setUserId(null);
    setUserRole(null);
    setUserName(null);
    setUserData(null);
    setFinancialData(null);
    setUserTransactions([]);
    setIsLoggedIn(false);
    setCurrentPage("signin");
    showToast("Signed out of session workspace.");
  };

  // Sync Node.js transactions spent aggregate back into PostgreSQL budget table
  const syncBudgetSpentAggregate = async (category, amtDiff, txType) => {
    if (txType !== "expense") return;
    try {
      const currentMonthStr = new Date().toISOString().slice(0, 7);
      // Find matches in db budgets list
      const matched = dbBudgetsList.find(b => b.category === category && b.month === currentMonthStr);
      const currentLimit = matched ? matched.amount : (
        category === "Housing" ? housingExpense :
        category === "Food" ? foodExpense :
        category === "Transport" ? travelExpense :
        category === "Utilities" ? utilitiesExpense :
        category === "Entertainment" ? entertainmentExpense : savingsExpense
      );
      const prevSpent = matched ? matched.spent : 0;
      const nextSpent = Math.max(0, prevSpent + amtDiff);

      // Raise notifications if limit exceeded
      if (nextSpent >= currentLimit) {
        setNotifications(n => [
          { id: Date.now() + Math.random(), title: "Budget Limit Exceeded", message: `Your spending on ${category} (${money(nextSpent)}) has exceeded your budget limit of ${money(currentLimit)}!`, date: new Date(), read: false },
          ...n
        ]);
      } else if (nextSpent >= 0.9 * currentLimit) {
        setNotifications(n => [
          { id: Date.now() + Math.random(), title: "Budget Warning (90%)", message: `Your spending on ${category} (${money(nextSpent)}) is nearing your budget limit of ${money(currentLimit)}.`, date: new Date(), read: false },
          ...n
        ]);
      }

      await fetch(`${GATEWAY_URL}/api/budgets/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(userId),
          category,
          amount: Number(currentLimit),
          spent: Number(nextSpent),
          month: currentMonthStr
        })
      });
      fetchBudgetsList();
    } catch (err) {
      console.error("Failed to sync spent values to budget tables:", err);
    }
  };

  const updateAccountBalance = (methodName, amt, txType) => {
    setAccounts(prev => prev.map(acc => {
      // Matches both "Cash Wallet" or "cash" type names
      const isMatch = acc.name.toLowerCase() === methodName.toLowerCase() || 
                      acc.id.toLowerCase() === methodName.toLowerCase() ||
                      (methodName.toLowerCase() === "cash" && acc.id === "cash") ||
                      (methodName.toLowerCase() === "credit card" && acc.id === "credit") ||
                      (methodName.toLowerCase() === "bank transfer" && acc.id === "bank") ||
                      (methodName.toLowerCase() === "upi" && acc.id === "upi");
      if (isMatch) {
        const nextBal = txType === "expense" ? acc.balance - amt : acc.balance + amt;
        // Raise a low balance warning notification if balance gets low (< 2000)
        if (nextBal < 2000 && acc.type !== "credit") {
          setNotifications(n => [
            { id: Date.now() + Math.random(), title: "Low Balance Warning", message: `Your ${acc.name} balance is critically low: ${money(nextBal)}`, date: new Date(), read: false },
            ...n
          ]);
        }
        return { ...acc, balance: nextBal };
      }
      return acc;
    }));
  };

  const handleAddOrEditTransaction = async (e) => {
    e.preventDefault();
    if (!logExpenseName || !logExpenseAmount) {
      showToast("Provide label description and amount values.", "error");
      return false;
    }

    setLoading(true);
    const amt = Number(logExpenseAmount);
    const fullDescription = logNotes ? `${logExpenseName} | Method: ${logPaymentMethod} | Notes: ${logNotes}` : `${logExpenseName} | Method: ${logPaymentMethod}`;

    try {
      if (editingTxnId) {
        // Edit Mode (PUT)
        const oldTxn = userTransactions.find(t => t._id === editingTxnId);
        const oldAmount = oldTxn ? oldTxn.amount : 0;
        const oldType = oldTxn ? oldTxn.type : "expense";

        const response = await fetch(`${GATEWAY_URL}/api/transactions/${editingTxnId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: logExpenseName,
            amount: amt,
            date: new Date(logExpenseDate).toISOString(),
            type: logTransactionType,
            category: logExpenseCategory,
            description: fullDescription
          })
        });
        if (response.ok) {
          showToast("Ledger entry modified successfully!");
          appendActivity(`Modified transaction entry: "${logExpenseName}" (${logTransactionType})`);
          
          // Reverse old transaction impact on accounts
          if (oldTxn) {
            const oldMethod = oldTxn.description.includes("Method:") ? oldTxn.description.split("Method:")[1].split("|")[0].trim() : "Cash Wallet";
            updateAccountBalance(oldMethod, oldAmount, oldType === "expense" ? "income" : "expense");
          }
          // Apply new transaction impact
          updateAccountBalance(logPaymentMethod, amt, logTransactionType);

          // Re-aggregate spent budget limits
          const amountDiff = amt - oldAmount;
          await syncBudgetSpentAggregate(logExpenseCategory, amountDiff, logTransactionType);
          
          setEditingTxnId(null);
          setLogNotes("");
          setShowTxnModal(false);
          fetchTransactions();
          return true;
        } else {
          let errMsg = "Failed to edit entry.";
          try { const errData = await response.json(); errMsg = errData.error || errMsg; } catch(_) {}
          showToast(errMsg, "error");
          return false;
        }
      } else {
        // Create Mode (POST)
        const response = await fetch(`${GATEWAY_URL}/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: Number(userId),
            name: logExpenseName,
            amount: amt,
            date: new Date(logExpenseDate).toISOString(),
            type: logTransactionType,
            category: logExpenseCategory,
            description: fullDescription
          })
        });
        if (response.ok) {
          showToast("Ledger entry appended successfully!");
          appendActivity(`Created transaction entry: "${logExpenseName}" (${logTransactionType})`);
          
          // Apply account balance update
          updateAccountBalance(logPaymentMethod, amt, logTransactionType);

          // Sync budget spent
          await syncBudgetSpentAggregate(logExpenseCategory, amt, logTransactionType);
          
          setLogExpenseName("");
          setLogExpenseAmount("");
          setLogNotes("");
          setLogRecurring(false);
          setShowTxnModal(false);
          fetchTransactions();
          return true;
        } else {
          let errMsg = "Failed to append transaction.";
          try { const errData = await response.json(); errMsg = errData.error || errMsg; } catch(_) {}
          showToast(errMsg, "error");
          return false;
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Network request error. Is the transaction service running on port 5000?", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id, category, amount, type) => {
    if (!confirm("Are you sure you want to delete this ledger entry?")) return;
    try {
      setLoading(true);
      const deletedTxn = userTransactions.find(t => t._id === id);
      const response = await fetch(`${GATEWAY_URL}/api/transactions/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        showToast("Ledger entry deleted.");
        appendActivity(`Deleted transaction entry: "${category}" (-${money(amount)})`);

        // Reverse transaction impact on accounts
        if (deletedTxn) {
          const oldMethod = deletedTxn.description.includes("Method:") ? deletedTxn.description.split("Method:")[1].split("|")[0].trim() : "Cash Wallet";
          updateAccountBalance(oldMethod, amount, type === "expense" ? "income" : "expense");
        }

        // Deduct from budget spent
        await syncBudgetSpentAggregate(category, -amount, type);
        fetchTransactions();
      } else {
        showToast("Could not delete record.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network connection error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudgets = async () => {
    try {
      setLoading(true);
      // Save user_financial_profile in PostgreSQL
      const response = await fetch(`${GATEWAY_URL}/financial/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: Number(userId),
          monthlyIncome: Number(monthlyIncome),
          savingsGoal: Number(targetSavingsGoal),
          housingBudget: Number(housingExpense),
          foodBudget: Number(foodExpense),
          travelBudget: Number(travelExpense),
          utilitiesBudget: Number(utilitiesExpense),
          entertainmentBudget: Number(entertainmentExpense),
          savingsInvestment: Number(savingsExpense),
          occupation,
          incomeFrequency,
          primaryIncomeSource,
          multipleIncomeSources,
          topSpendingCategories,
          dailyExpenseReminders,
          financialGoal,
          savingFor,
          billReminders,
          dailyExpenseAlerts,
          overspendingAlerts,
        }),
      });
      
      // Save individual budget objects in new budgets table
      const currentMonthStr = new Date().toISOString().slice(0, 7);
      const categoriesMap = [
        { name: "Housing", cap: housingExpense },
        { name: "Food", cap: foodExpense },
        { name: "Transport", cap: travelExpense },
        { name: "Utilities", cap: utilitiesExpense },
        { name: "Entertainment", cap: entertainmentExpense },
        { name: "Savings", cap: savingsExpense }
      ];

      for (let item of categoriesMap) {
        const matched = dbBudgetsList.find(b => b.category === item.name);
        const spentAmt = matched ? matched.spent : 0.00;
        await fetch(`${GATEWAY_URL}/api/budgets/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: Number(userId),
            category: item.name,
            amount: Number(item.cap),
            spent: Number(spentAmt),
            month: currentMonthStr
          })
        });
      }

      if (response.ok) {
        showToast("Budgets and alerts preferences successfully committed.");
        appendActivity("Saved and updated monthly budget targets and preferences");
        fetchFinancialData();
        fetchBudgetsList();
        setIsEditingBudget(false);
      } else {
        showToast("Could not save profile budgets.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Save operation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${GATEWAY_URL}/api/users/${userId}/complete-onboarding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullname: profileName,
          email: profileEmail,
          phone: profilePhone,
          dateOfBirth: profileDob,
          preferredCurrency: profileCurrency,
        }),
      });
      if (response.ok) {
        await handleSaveBudgets();
        localStorage.setItem("fullname", profileName);
        setUserName(profileName);
        showToast("Identity settings verified and saved.");
        appendActivity(`Updated profile details for "${profileName}"`);
        setIsEditingProfile(false);
        fetchUserData();
      } else {
        showToast("Failed to edit user profile details.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network profile update failure.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPasswordVal !== confirmNewPasswordVal) {
      showToast("New passwords do not match!", "error");
      return;
    }
    if (newPasswordVal.length < 4) {
      showToast("Password must be at least 4 characters long.", "error");
      return;
    }
    setChangingPassword(true);
    try {
      const response = await fetch(`${GATEWAY_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: Number(userId),
          currentPassword: currentPasswordVal,
          newPassword: newPasswordVal
        })
      });
      const data = await response.json();
      if (response.ok && data.code === 200) {
        showToast("Password updated successfully!");
        setCurrentPasswordVal("");
        setNewPasswordVal("");
        setConfirmNewPasswordVal("");
        appendActivity("Changed account password");
      } else {
        showToast(data.message || "Failed to change password", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Server connection error.", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const exportToCSV = async () => {
    const txns = await getFilteredTransactionsForExport();
    if (txns.length === 0) {
      showToast("No transaction records match active filters.", "error");
      return;
    }
    const headers = ["ID", "Name/Description", "Category", "Date", "Type", "Amount"];
    const rows = txns.map(t => [
      t._id || t.id,
      t.description || t.name,
      t.category,
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.amount
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MoneyManager_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Statement CSV export download initialized.");
    appendActivity("Exported statement data to CSV");
  };

  const exportToPDF = async () => {
    const txns = await getFilteredTransactionsForExport();
    if (txns.length === 0) {
      showToast("No transaction records match active filters.", "error");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocked! Please allow pop-ups to export PDF.", "error");
      return;
    }
    
    const overallExpenses = txns
      .filter(t => t.type === "expense")
      .reduce((sum, current) => sum + current.amount, 0);

    const overallIncome = txns
      .filter(t => t.type === "income")
      .reduce((sum, current) => sum + current.amount, 0);
      
    const tableRowsHtml = txns.map(t => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${t.description || t.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 11px;">${t.category}</span></td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${new Date(t.date).toLocaleDateString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-weight: bold; color: ${t.type === 'income' ? '#16a34a' : '#dc2626'}">${t.type}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: ${t.type === 'income' ? '#16a34a' : '#dc2626'}">${t.type === 'income' ? '+' : '-'} Rs. ${t.amount.toLocaleString()}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Money GO Statement</title>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #4f46e5; }
            .title { font-size: 18px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 35px; }
            .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
            .stat-card p { margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; }
            .stat-card h3 { margin: 8px 0 0 0; font-size: 20px; font-weight: 700; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px 10px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 12px; text-transform: uppercase; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Money GO</div>
            <div class="title">Transaction Statement</div>
          </div>
          <div style="margin-bottom: 25px;">
            <p style="margin: 0; font-size: 14px;"><strong>Account Holder:</strong> ${userName || 'User Profile'}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px;"><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <p>Total Inflow</p>
              <h3 style="color: #16a34a;">Rs. ${overallIncome.toLocaleString()}</h3>
            </div>
            <div class="stat-card">
              <p>Total Outflow</p>
              <h3 style="color: #dc2626;">Rs. ${overallExpenses.toLocaleString()}</h3>
            </div>
            <div class="stat-card">
              <p>Net Balance</p>
              <h3 style="color: #0f172a;">Rs. ${(overallIncome - overallExpenses).toLocaleString()}</h3>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Type</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated automatically via Money GO client application dashboard.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast("Statement PDF export initialized.");
    appendActivity("Exported statement data to PDF");
  };

  const triggerPostgresBackup = async () => {
    showToast("Triggered automated backup write mapping.");
    showToast("Completed backup export: project1_backup.sql");
  };

  const triggerIndexOptimize = async () => {
    showToast("Running PostgreSQL structural re-indexing...");
    setTimeout(() => {
      showToast("Optimization Complete. Database indexes operational.");
    }, 1000);
  };

  // --- COMPUTE AND RENDER MAPPING DETAILS ---
  if (!isLoggedIn) {
    const isSignup = currentPage === "signup";
    return (
      <main className="auth-page">
        {/* Render Toast Alert Banners */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast-message toast-${t.type}`}>
              <AlertCircle size={18} />
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        <button className="auth-brand" type="button" onClick={() => { window.location.reload(); }}>
          <img src={logoImg} alt="Money GO logo" />
        </button>

        <section className="auth-panel">
          <div className="auth-copy">
            <span className="auth-kicker">{isSignup ? "Create workspace" : "Welcome back"}</span>
            <h1>{isSignup ? "Build smarter financial habits." : "Take control of your money."}</h1>
            <p>
              {isSignup
                ? "Create your account, choose your role, and enter the workspace designed for your finance flow."
                : "Access your role-based dashboard for budgets, transactions, approvals, and system activity."}
            </p>
          </div>

          <form className={isSignup ? "auth-card signup-auth-card" : "auth-card"} onSubmit={isSignup ? handleSignUp : handleSignIn}>
            <div className="auth-card-header">
              <span>{isSignup ? "Sign up" : "Login"}</span>
              <h2>{isSignup ? "Create an account" : "Enter your account"}</h2>
            </div>

            {isSignup && (
              <>
                <div className="auth-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-field two-col-field">
                  <div>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="auth-field">
              <label>E-mail address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "40px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <>
                <div className="auth-field">
                  <label>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ paddingRight: "40px" }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label>Currency Preference</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div className="auth-field">
                  <label>Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="1">User</option>
                    <option value="2">Admin</option>
                    <option value="3">Manager</option>
                  </select>
                </div>

                <div className="auth-terms" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                  />
                  <label htmlFor="terms" style={{ fontSize: "13px", color: "#64748b", cursor: "pointer" }}>
                    I agree to the Terms & Conditions
                  </label>
                </div>
              </>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Processing..." : isSignup ? "Create account" : "Login"}
            </button>

            <div className="auth-switch">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <button type="button" onClick={() => { setCurrentPage(isSignup ? "signin" : "signup"); setError(""); }}>
                {isSignup ? "Login" : "Sign up"}
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  // Render onboarding
  if (isLoggedIn && showOnboarding) {
    return (
      <Onboarding
        userId={userId}
        token={token}
        onComplete={() => {
          setShowOnboarding(false);
          fetchFinancialData();
          fetchBudgetsList();
        }}
        onLogout={handleLogout}
      />
    );
  }

  // --- RENDER CORE LOGGED IN DASHBOARD ROUTER ---
  const meta = roleMeta[userRole];

  // Helper arrays for category maps
  // Helper arrays for category maps
  const categoriesList = categories.map(c => c.name);
  
  const baseCategoryColors = {
    Housing: "#4f46e5",
    Food: "#10b981",
    Transport: "#3b82f6",
    Utilities: "#f59e0b",
    Entertainment: "#ea580c",
    Savings: "#8b5cf6",
    Salary: "#10b981",
    Freelance: "#06b6d4",
    Shopping: "#ec4899",
    Bills: "#f43f5e"
  };

  const categoryColors = {};
  categories.forEach((cat, index) => {
    categoryColors[cat.name] = cat.color || baseCategoryColors[cat.name] || `hsl(${(index * 360 / Math.max(1, categories.length)) % 360}, 70%, 50%)`;
  });

  // Compute stats calculations for User Dashboard
  const overallExpensesLogged = userTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, current) => sum + current.amount, 0);

  const overallIncomeLogged = userTransactions
    .filter(t => t.type === "income")
    .reduce((sum, current) => sum + current.amount, 0);

  const availableNetBalance = overallIncomeLogged - overallExpensesLogged;

  const budgetLimitsMap = {};
  categories.forEach(c => {
    const val = (c.name === "Housing" ? housingExpense :
                 c.name === "Food" ? foodExpense :
                 c.name === "Transport" ? travelExpense :
                 c.name === "Utilities" ? utilitiesExpense :
                 c.name === "Entertainment" ? entertainmentExpense :
                 c.name === "Savings" ? savingsExpense : 0);
    budgetLimitsMap[c.name] = Number(val) || 0;
  });

  const aggregatedAllocatedBudgets = Object.values(budgetLimitsMap).reduce((a, b) => a + b, 0);

  // Compute dynamically spent totals from Database budgets schema
  const dbSpentMap = {};
  categories.forEach(c => {
    dbSpentMap[c.name] = dbBudgetsList.find(b => b.category === c.name)?.spent || 0;
  });

  // Helper check for Top spending categories
  const isTopCategory = (cat) => {
    return (topSpendingCategories || "")
      .split(",")
      .map(c => c.trim().toLowerCase())
      .includes(cat.trim().toLowerCase());
  };

  // --- RENDER DYNAMIC SVG CHART CREATIONS ---

  // 1. Categories Donut Chart (Reports / Overview)
  const renderDonutChart = () => {
    const totalSpent = Object.values(dbSpentMap).reduce((a, b) => a + b, 0);
    if (totalSpent === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
          No logged expenses to render category donut distribution.
        </div>
      );
    }

    const radius = 70;
    const circ = 2 * Math.PI * radius;
    let currentOffset = 0;

    return (
      <div className="chart-svg-container">
        <svg width="240" height="240" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--line)" strokeWidth="12" />
          {categoriesList.map(cat => {
            const spent = dbSpentMap[cat] || 0;
            if (spent === 0) return null;
            const percent = (spent / totalSpent) * 100;
            const strokeDash = `${(percent / 100) * circ} ${circ}`;
            const strokeOffset = circ - currentOffset + (circ / 4); // start at top (12 o'clock)
            currentOffset += (percent / 100) * circ;

            return (
              <circle
                key={cat}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={categoryColors[cat]}
                strokeWidth="16"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                className="chart-svg-donut-slice"
                transform="rotate(-90, 100, 100)"
              />
            );
          })}
          <circle cx="100" cy="100" r="50" fill="var(--card-bg)" />
          <text x="100" y="96" textAnchor="middle" fill="var(--ink)" fontSize="12" fontWeight="700">TOTAL</text>
          <text x="100" y="114" textAnchor="middle" fill="var(--ink)" fontSize="13" fontWeight="900">
            {money(totalSpent).split('.')[0]}
          </text>
        </svg>
      </div>
    );
  };

  // 2. Budget vs Actual Spent Comparison Bar Chart
  const renderCompareBarChart = () => {
    const chartWidth = 460;
    const chartHeight = 220;
    const padding = 40;
    
    // Find Max Value for scaling
    const maxVal = Math.max(
      ...Object.values(budgetLimitsMap),
      ...Object.values(dbSpentMap),
      5000 // default minimum bound
    );

    const scaleY = (val) => chartHeight - padding - (val / maxVal) * (chartHeight - 2 * padding);
    const colWidth = 22;

    return (
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const val = maxVal * ratio;
          const y = scaleY(val);
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="var(--line)" strokeDasharray="4,4" />
              <text x={padding - 6} y={y + 4} fill="var(--muted)" fontSize="9" textAnchor="end">{money(val).split('.')[0]}</text>
            </g>
          );
        })}

        {/* X Axis labels & Bars */}
        {categoriesList.map((cat, idx) => {
          const limit = budgetLimitsMap[cat];
          const spent = dbSpentMap[cat];
          
          const xCenter = padding + 40 + idx * 60;
          const yLimit = scaleY(limit);
          const ySpent = scaleY(spent);

          const hLimit = chartHeight - padding - yLimit;
          const hSpent = chartHeight - padding - ySpent;

          return (
            <g key={idx}>
              {/* Limit Bar (Indigo) */}
              <rect
                x={xCenter - colWidth - 2}
                y={yLimit}
                width={colWidth}
                height={Math.max(2, hLimit)}
                fill="#818cf8"
                rx="4"
                className="chart-svg-bar"
              />
              {/* Spent Bar (Rose if over budget, otherwise Emerald) */}
              <rect
                x={xCenter + 2}
                y={ySpent}
                width={colWidth}
                height={Math.max(2, hSpent)}
                fill={spent > limit ? "#f87171" : "#34d399"}
                rx="4"
                className="chart-svg-bar"
              />
              {/* Category short label */}
              <text x={xCenter} y={chartHeight - 12} fill="var(--ink)" fontSize="9" fontWeight="600" textAnchor="middle">
                {cat.slice(0, 5)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // 3. Weekly spending trends (Line Chart)
  const renderWeeklyLineChart = () => {
    // Group transactions of last 7 days
    const weeklyData = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      return {
        dateStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
        rawDate: d.toISOString().split('T')[0],
        amount: 0
      };
    }).reverse();

    // Map amounts
    userTransactions.forEach(t => {
      if (t.type !== 'expense') return;
      const txDateStr = new Date(t.date).toISOString().split('T')[0];
      const match = weeklyData.find(w => w.rawDate === txDateStr);
      if (match) {
        match.amount += t.amount;
      }
    });

    const maxWeekly = Math.max(...weeklyData.map(w => w.amount), 2000);
    const chartWidth = 460;
    const chartHeight = 220;
    const padding = 40;

    const scaleY = (val) => chartHeight - padding - (val / maxWeekly) * (chartHeight - 2 * padding);
    const scaleX = (idx) => padding + 40 + idx * 55;

    // Build SVG Path
    const points = weeklyData.map((w, idx) => `${scaleX(idx)},${scaleY(w.amount)}`).join(" ");

    return (
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const val = maxWeekly * ratio;
          const y = scaleY(val);
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="var(--line)" strokeDasharray="2,2" />
              <text x={padding - 6} y={y + 4} fill="var(--muted)" fontSize="9" textAnchor="end">{money(val).split('.')[0]}</text>
            </g>
          );
        })}

        {/* Chart line path */}
        {points && (
          <polyline
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            points={points}
            strokeLinecap="round"
          />
        )}

        {/* Scatter points dots */}
        {weeklyData.map((w, idx) => {
          const x = scaleX(idx);
          const y = scaleY(w.amount);
          return (
            <g key={idx}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth="2"
                className="chart-svg-line-point"
              />
              <text x={x} y={chartHeight - 12} fill="var(--ink)" fontSize="9" fontWeight="600" textAnchor="middle">
                {w.dateStr}
              </text>
              {w.amount > 0 && (
                <text x={x} y={y - 8} fill="var(--muted)" fontSize="8" fontWeight="600" textAnchor="middle">
                  {money(w.amount).split('.')[0]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const fontClass = accessibilityFontSize === "small" ? "font-size-small" : accessibilityFontSize === "large" ? "font-size-large" : "";
  const compactClass = accessibilityCompactMode ? "compact-mode" : "";

  return (
    <div className={`dashboard-container app-dashboard ${fontClass} ${compactClass}`}>
      
      {/* Toast Alert message lists */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-message toast-${t.type}`}>
            <AlertCircle size={18} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src={logoImg} alt="Money GO logo" />
          <div>
            <span>{userRole === "2" ? "Operations OS" : userRole === "3" ? "Manager Node" : "Finance OS"}</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {meta.navigation.map((item, index) => {
            const Icon = item.icon;
            const displayName = (translations[selectedLanguage] && translations[selectedLanguage][item.name]) || item.name;
            return (
              <button 
                key={item.name} 
                className={index === activeTab ? "nav-item active" : "nav-item"} 
                onClick={() => {
                  setActiveTab(index);
                  setError("");
                }}
                type="button"
              >
                <Icon className="icon-sm" />
                <span>{displayName}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-brief">
          <span>WORKSPACE CONFIG</span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
            <button 
              type="button" 
              onClick={() => {
                const nextTheme = themeMode === "light" ? "dark" : "light";
                setThemeMode(nextTheme);
                appendActivity(`Switched UI theme to ${nextTheme} mode`);
              }}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}
            >
              {themeMode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span style={{ fontSize: "11px", color: "#cbd5e1" }}>
              {themeMode === "dark" ? "Dark Mode Active" : "Light Mode Active"}
            </span>
          </div>
        </div>
      </aside>

      <div className="dashboard-workspace">
        <header className="dashboard-header">
          <div className="header-content">
            <div>
              <span className="dashboard-eyebrow">{(translations[selectedLanguage]?.[meta.navigation[activeTab]?.name]) || meta.navigation[activeTab]?.name} Panel</span>
              <h1 className="welcome-title">{meta.heading}</h1>
              <p className="welcome-subtitle">Account Holder: <strong>{profileName}</strong> | Currency Preference: {profileCurrency}</p>
            </div>
            <div className="header-actions">
              <span className="user-role-tag">
                <Shield className="icon-sm inline-icon" /> {meta.title}
              </span>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut className="icon-sm" /> Logout
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          
          {/* ========================================================================= */}
          {/* USER DASHBOARD (ROLE 1) */}
          {/* ========================================================================= */}
          {Number(userRole) === 1 && (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 0 && (
                <>
                  <section className="dashboard-hero-card">
                    <div className="hero-text-content" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="dashboard-eyebrow" style={{ color: "#3b82f6", letterSpacing: "1px", textTransform: "uppercase" }}>Financial Matrix Baseline</span>
                      <h2>Real-time operational variables synced.</h2>
                      <p style={{ margin: "4px 0", color: "#cbd5e1" }}>Configured Target Savings Cap: {money(savingsExpense)} | Setup Budget Allocations: {money(aggregatedAllocatedBudgets)}</p>
                      <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        <span className="user-role-tag" style={{ background: "rgba(255, 255, 255, 0.15)", color: "#ffffff", border: "none", fontSize: "12px" }}>
                          🎯 Goal: <strong>{financialGoal}</strong>
                        </span>
                        <span className="user-role-tag" style={{ background: "rgba(255, 255, 255, 0.15)", color: "#ffffff", border: "none", fontSize: "12px" }}>
                          💼 Occupation: <strong style={{ textTransform: "capitalize" }}>{occupation}</strong>
                        </span>
                      </div>
                    </div>
                  </section>

                  <div className="stats-grid">
                    <StatCard icon={Wallet} label="Live Balance Available" value={money(availableNetBalance)} note="Calculated cash flows" tone="teal" trend="+12%" />
                    <StatCard icon={TrendingUp} label="Aggregated Inflow Matrix" value={money(overallIncomeLogged)} note="All logged inflow" tone="green" trend="+8%" />
                    <StatCard icon={CreditCard} label="Aggregated Outflow Spent" value={money(overallExpensesLogged)} note="Dynamic database tracking" tone="red" trend="-3%" />
                    <StatCard icon={PiggyBank} label="Goal Milestone Target" value={money(savingsExpense)} note="Target savings ceiling" tone="blue" trend="+15%" />
                  </div>

                  {dailyExpenseReminders && (
                    <div className="alert alert-success" style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", padding: "12px", borderRadius: "10px", marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center", fontSize: "13px" }}>
                      <span>🔔 <strong>Daily Expense Reminder:</strong> Don't forget to log outflow transactions before the end of the day.</span>
                    </div>
                  )}

                  {/* Add Ledger Transaction Quick Entry */}
                  <div className="panel-card live-interaction-panel">
                    <h2 className="panel-title"><Plus className="inline-icon text-teal icon-sm" /> Quick Log Transaction</h2>
                    <form onSubmit={handleAddOrEditTransaction} className="live-expense-form">
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
                        <div className="dashboard-input-group" style={{marginBottom: 0}}>
                          <label className="dashboard-input-label">Transaction Label Description</label>
                          <input className="dashboard-panel-input" type="text" placeholder="e.g. Invoicing, Groceries" value={logExpenseName} onChange={(e) => setLogExpenseName(e.target.value)} required />
                        </div>
                        <div className="dashboard-input-group" style={{marginBottom: 0}}>
                          <label className="dashboard-input-label">Flow Layout Type</label>
                          <select className="dashboard-panel-select" value={logTransactionType} onChange={(e) => setLogTransactionType(e.target.value)}>
                            <option value="expense">Debit / Outflow Expense</option>
                            <option value="income">Credit / Inflow Income</option>
                          </select>
                        </div>
                        <div className="dashboard-input-group" style={{marginBottom: 0}}>
                          <label className="dashboard-input-label">Amount (Rs.)</label>
                          <input className="dashboard-panel-input" type="number" placeholder="0.00" value={logExpenseAmount} onChange={(e) => setLogExpenseAmount(e.target.value)} required />
                        </div>
                        <div className="dashboard-input-group" style={{marginBottom: 0}}>
                          <label className="dashboard-input-label">Track Category</label>
                          <select className="dashboard-panel-select" value={logExpenseCategory} onChange={(e) => setLogExpenseCategory(e.target.value)}>
                            <option value="Housing">Housing</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Savings">Savings</option>
                          </select>
                        </div>
                        <div className="dashboard-input-group" style={{marginBottom: 0}}>
                          <label className="dashboard-input-label">Payment Method</label>
                          <select className="dashboard-panel-select" value={logPaymentMethod} onChange={(e) => setLogPaymentMethod(e.target.value)}>
                            <option value="Cash Wallet">Cash Wallet</option>
                            <option value="Bank Account">Bank Account</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="UPI Account">UPI Account</option>
                          </select>
                        </div>
                        <div className="dashboard-input-group" style={{marginBottom: 0}}>
                          <label className="dashboard-input-label">Date</label>
                          <input className="dashboard-panel-input" type="date" value={logExpenseDate} onChange={(e) => setLogExpenseDate(e.target.value)} required />
                        </div>
                      </div>
                      <button type="submit" className="add-expense-btn" style={{marginTop: "20px", marginBottom: 0}}>Commit Record to Microservice</button>
                    </form>
                  </div>

                  <div className="dashboard-grid-two-col">
                    <div className="panel-card">
                      <div className="panel-header">
                        <h2 className="panel-title">Recent Ledger Items</h2>
                        <button className="table-action-btn" onClick={() => setActiveTab(1)}>View Full Statement Screen</button>
                      </div>
                      <div className="transactions-list">
                        {userTransactions.slice(0, 4).map((t, idx) => (
                          <div key={t._id || idx} className="transaction-item">
                            <div>
                              <p className="transaction-name">{t.description || t.name}</p>
                              <span className="category-capsule-tag">{t.category}</span>
                              <span className="transaction-date" style={{marginLeft: "10px"}}>{new Date(t.date).toLocaleDateString()}</span>
                            </div>
                            <span className={`transaction-amount ${t.type === "income" ? "amount-income" : "amount-expense"}`}>
                              {t.type === "income" ? `+ ${money(t.amount)}` : `- ${money(t.amount)}`}
                            </span>
                          </div>
                        ))}
                        {userTransactions.length === 0 && (
                          <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>No transaction logs.</div>
                        )}
                      </div>
                    </div>

                    <div className="panel-card">
                      <div className="panel-header">
                        <h2 className="panel-title">Live Budget Threshold Tracks</h2>
                        <button className="table-action-btn" onClick={() => setActiveTab(4)}>Modify Targets</button>
                      </div>
                      {categoriesList.map((key) => {
                        const limit = budgetLimitsMap[key] || 1;
                        const spent = dbSpentMap[key] || 0;
                        const ratio = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
                        const isHighPriority = isTopCategory(key);
                        return (
                          <div className="metric-row-card" key={key} style={{ marginBottom: "12px", borderLeft: isHighPriority ? "3px solid #3b82f6" : "none" }}>
                            <div className="metric-header">
                              <strong>{key} Sector {isHighPriority && <span style={{color: "#3b82f6", fontSize: "10px"}}>⭐</span>}</strong>
                              <span>{ratio}% Used</span>
                            </div>
                            <div className="progress-bar-track">
                              <div className="progress-bar-fill" style={{ width: `${ratio}%`, background: (ratio > 90 && overspendingAlerts) ? "#dc2626" : "#10b981" }} />
                            </div>
                            <div className="metric-footer"><span>Spent: {money(spent)}</span><span>Limit Cap: {money(limit)}</span></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RECENT ACTIVITY TIMELINE */}
                  <div className="panel-card" style={{ marginTop: "24px" }}>
                    <div className="panel-header">
                      <h2 className="panel-title"><Activity className="inline-icon text-indigo icon-sm" /> Recent System Activity Logs</h2>
                      <button className="table-action-btn" onClick={() => appendActivity("Manually refreshed activity logs")}>Refresh Log</button>
                    </div>
                    <div className="activity-timeline">
                      {activityLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="activity-item">
                          <div className="activity-dot"></div>
                          <div className="activity-content">
                            <p className="activity-text">{log.action}</p>
                            <span className="activity-time">{log.timestamp.toLocaleTimeString()} - {log.timestamp.toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TRANSACTIONS TAB */}
              {activeTab === 1 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header" style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 className="panel-title"><List className="inline-icon icon-sm text-blue" /> Comprehensive Statement Ledger</h2>
                      <p className="panel-subtitle">Audited pipeline displaying historical assets and transaction allocations.</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div className="export-buttons-group">
                        <button className="export-btn" onClick={exportToCSV}>
                          <FileText size={15} /> Export CSV
                        </button>
                        <button className="export-btn" onClick={exportToExcel}>
                          <FileSpreadsheet size={15} /> Export Excel
                        </button>
                        <button className="export-btn" onClick={exportToPDF}>
                          <FileText size={15} /> Export PDF
                        </button>
                      </div>
                      <button className="setup-submit-btn" style={{ width: "auto", margin: 0, padding: "0 16px", height: "40px" }} onClick={() => { setEditingTxnId(null); setLogExpenseName(""); setLogExpenseAmount(""); setShowTxnModal(true); }}>
                        <Plus size={16} /> Log Entry
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters Layout Row */}
                  <div className="search-filter-layout-row">
                    <div className="search-input-wrapper" style={{ position: "relative" }}>
                      <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                      <input 
                        type="text" 
                        placeholder="Search description labels..." 
                        className="dashboard-panel-input" 
                        style={{ paddingLeft: "42px" }}
                        value={txnSearch}
                        onChange={(e) => setTxnSearch(e.target.value)}
                      />
                    </div>
                    <div className="filter-select-wrapper">
                      <select className="dashboard-panel-select" value={txnTypeFilter} onChange={(e) => setTxnTypeFilter(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                    <div className="filter-select-wrapper">
                      <select className="dashboard-panel-select" value={txnCategoryFilter} onChange={(e) => setTxnCategoryFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="filter-select-wrapper" style={{ width: "190px" }}>
                      <input type="date" className="dashboard-panel-input" value={txnStartDate} onChange={(e) => setTxnStartDate(e.target.value)} />
                    </div>
                    <div className="filter-select-wrapper" style={{ width: "190px" }}>
                      <input type="date" className="dashboard-panel-input" value={txnEndDate} onChange={(e) => setTxnEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="table-scroll-frame" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
                    <table className="enterprise-data-table">
                      <thead>
                        <tr>
                          <th>Description Label</th>
                          <th>Category</th>
                          <th>Date</th>
                          <th>Flow Layout Type</th>
                          <th>Value</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userTransactions.map((t, idx) => (
                          <tr key={t._id || idx}>
                            <td><strong>{t.description || t.name}</strong></td>
                            <td><span className="category-capsule-tag">{t.category}</span></td>
                            <td className="transaction-date">{new Date(t.date).toLocaleDateString()}</td>
                            <td>
                              <span className={`flow-status-pill ${t.type === 'income' ? 'status-credit' : 'status-debit'}`}>
                                {t.type.toUpperCase()}
                              </span>
                            </td>
                            <td className={t.type === 'income' ? 'amount-income font-semibold' : 'amount-expense font-semibold'}>
                              {t.type === 'income' ? `+ ${money(t.amount)}` : `- ${money(t.amount)}`}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button className="profile-action-toggle-btn" style={{ padding: "4px 8px" }} onClick={() => {
                                  setEditingTxnId(t._id);
                                  setLogExpenseName(t.description || t.name);
                                  setLogExpenseAmount(t.amount);
                                  setLogExpenseCategory(t.category);
                                  setLogTransactionType(t.type);
                                  setLogExpenseDate(new Date(t.date).toISOString().split('T')[0]);
                                  setShowTxnModal(true);
                                }}>
                                  Edit
                                </button>
                                <button className="logout-btn" style={{ padding: "4px 8px", background: "#ef4444" }} onClick={() => handleDeleteTransaction(t._id, t.category, t.amount, t.type)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {userTransactions.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                              No transactions match the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination component controls */}
                  <div className="pagination-container">
                    <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                      Showing Page <strong>{transactionsPage}</strong> of <strong>{transactionsTotalPages}</strong> (Total: {transactionsTotalCount} records)
                    </span>
                    <div className="pagination-buttons">
                      <button className="pagination-btn" disabled={transactionsPage <= 1} onClick={() => setTransactionsPage(prev => Math.max(1, prev - 1))}>
                        <ChevronLeft size={16} /> Previous
                      </button>
                      <button className="pagination-btn" disabled={transactionsPage >= transactionsTotalPages} onClick={() => setTransactionsPage(prev => Math.min(transactionsTotalPages, prev + 1))}>
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ADD TRANSACTION TAB */}
              {activeTab === 2 && (
                <div className="panel-card view-container-fade" style={{ maxWidth: "600px", margin: "0 auto" }}>
                  <div className="panel-header border-bottom-header">
                    <div>
                      <h2 className="panel-title">
                        <Plus className="inline-icon icon-sm text-teal" /> Log New Transaction
                      </h2>
                      <p className="panel-subtitle">Record your financial inflow or outflow directly into the system ledger.</p>
                    </div>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const success = await handleAddOrEditTransaction(e);
                    if (success) setActiveTab(1);
                  }} style={{ marginTop: "24px" }}>
                    <div className="dashboard-input-group">
                      <label className="dashboard-input-label">Transaction Label Description</label>
                      <input 
                        className="dashboard-panel-input" 
                        type="text" 
                        placeholder="e.g. Salary, Groceries, Rent" 
                        value={logExpenseName} 
                        onChange={(e) => setLogExpenseName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="dashboard-input-group">
                      <label className="dashboard-input-label">Flow Direction Type</label>
                      <select 
                        className="dashboard-panel-select" 
                        value={logTransactionType} 
                        onChange={(e) => setLogTransactionType(e.target.value)}
                      >
                        <option value="expense">Debit / Outflow Expense</option>
                        <option value="income">Credit / Inflow Income</option>
                      </select>
                    </div>
                    <div className="dashboard-input-group">
                      <label className="dashboard-input-label">Amount (Rs.)</label>
                      <input 
                        className="dashboard-panel-input" 
                        type="number" 
                        placeholder="0.00" 
                        value={logExpenseAmount} 
                        onChange={(e) => setLogExpenseAmount(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="dashboard-input-group">
                      <label className="dashboard-input-label">Sector Category</label>
                      <select 
                        className="dashboard-panel-select" 
                        value={logExpenseCategory} 
                        onChange={(e) => setLogExpenseCategory(e.target.value)}
                      >
                        {categoriesList.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="dashboard-input-group">
                      <label className="dashboard-input-label">Transaction Date</label>
                      <input 
                        className="dashboard-panel-input" 
                        type="date" 
                        value={logExpenseDate} 
                        onChange={(e) => setLogExpenseDate(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="dashboard-input-group">
                      <label className="dashboard-input-label">Payment Method / Account</label>
                      <select 
                        className="dashboard-panel-select" 
                        value={logPaymentMethod} 
                        onChange={(e) => setLogPaymentMethod(e.target.value)}
                      >
                        <option value="Cash Wallet">Cash Wallet</option>
                        <option value="Bank Account">Bank Account</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="UPI Account">UPI Account</option>
                      </select>
                    </div>
                    <div className="dashboard-input-group">
                      <label className="dashboard-input-label">Notes</label>
                      <input 
                        className="dashboard-panel-input" 
                        type="text" 
                        placeholder="e.g. Paid to organic farm" 
                        value={logNotes} 
                        onChange={(e) => setLogNotes(e.target.value)} 
                      />
                    </div>
                    <div className="dashboard-input-group">
                      <label className="dashboard-input-label">Upload Receipt Image (Optional)</label>
                      <input 
                        className="dashboard-panel-input" 
                        type="file" 
                        style={{ paddingTop: '10px' }} 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setLogReceiptImage(e.target.files[0].name);
                            showToast("Receipt uploaded successfully (mock cache)");
                          }
                        }} 
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "16px 0" }}>
                      <input 
                        type="checkbox" 
                        id="tab-recurring" 
                        checked={logRecurring} 
                        onChange={(e) => setLogRecurring(e.target.checked)} 
                      />
                      <label htmlFor="tab-recurring" style={{ fontSize: "14px", color: "var(--ink)", cursor: "pointer" }}>Is this a recurring transaction?</label>
                    </div>
                    <button type="submit" className="setup-submit-btn" style={{ width: "100%", marginTop: "12px" }} disabled={loading}>
                      {loading ? "Processing..." : "Commit Transaction to Ledger"}
                    </button>
                  </form>
                </div>
              )}

              {/* CATEGORIES TAB */}
              {activeTab === 3 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header">
                    <div>
                      <h2 className="panel-title">
                        <Folder className="inline-icon icon-sm text-indigo" /> Categories
                      </h2>
                      <h3>{editingCatId ? "Edit Category" : "Create New Category"}</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCatName.trim()) return;
                        
                        if (editingCatId) {
                          // Edit mode
                          setCategories(prev => prev.map(c => c.id === editingCatId ? {
                            ...c,
                            name: newCatName.trim(),
                            type: newCatType,
                            color: newCatColor,
                            icon: newCatIcon
                          } : c));
                          showToast(`Category "${newCatName}" updated successfully.`);
                          appendActivity(`Updated custom category: "${newCatName}"`);
                          setEditingCatId(null);
                          setNewCatName("");
                        } else {
                          // Create mode
                          if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
                            showToast("Category name already exists!", "error");
                            return;
                          }
                          const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
                          const newCat = { 
                            id: nextId, 
                            name: newCatName.trim(), 
                            type: newCatType,
                            color: newCatColor,
                            icon: newCatIcon
                          };
                          setCategories(prev => [...prev, newCat]);
                          setNewCatName("");
                          showToast(`Category "${newCatName}" added successfully.`);
                          appendActivity(`Created custom category: "${newCatName}" (${newCatType})`);
                        }
                      }} style={{ marginTop: "16px" }}>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Category Name</label>
                          <input 
                            className="dashboard-panel-input" 
                            type="text" 
                            placeholder="e.g. Travel, Healthcare" 
                            value={newCatName} 
                            onChange={(e) => setNewCatName(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Flow Type Classification</label>
                          <select 
                            className="dashboard-panel-select" 
                            value={newCatType} 
                            onChange={(e) => setNewCatType(e.target.value)}
                          >
                            <option value="expense">Debit / Expense Category</option>
                            <option value="income">Credit / Income Category</option>
                          </select>
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Category Icon</label>
                          <select 
                            className="dashboard-panel-select" 
                            value={newCatIcon} 
                            onChange={(e) => setNewCatIcon(e.target.value)}
                          >
                            <option value="🛍️">🛍️ Shopping</option>
                            <option value="🏠">🏠 Housing</option>
                            <option value="🍔">🍔 Food</option>
                            <option value="🚗">🚗 Commute</option>
                            <option value="⚡">⚡ Utilities</option>
                            <option value="🍿">🍿 Entertainment</option>
                            <option value="🏥">🏥 Healthcare</option>
                            <option value="🎓">🎓 Education</option>
                            <option value="💼">💼 Work</option>
                            <option value="✈️">✈️ Travel</option>
                            <option value="💰">💰 Savings</option>
                          </select>
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Category Color Tag</label>
                          <input 
                            type="color" 
                            className="dashboard-panel-input" 
                            style={{ height: "48px", padding: "4px", cursor: "pointer" }}
                            value={newCatColor} 
                            onChange={(e) => setNewCatColor(e.target.value)} 
                          />
                        </div>
                        <button type="submit" className="setup-submit-btn" style={{ width: "100%", marginTop: "16px" }}>
                          {editingCatId ? "Update Category" : "Add Custom Category"}
                        </button>
                        {editingCatId && (
                          <button 
                            type="button" 
                            className="profile-action-toggle-btn" 
                            style={{ width: "100%", marginTop: "8px", justifyContent: "center" }}
                            onClick={() => {
                              setEditingCatId(null);
                              setNewCatName("");
                            }}
                          >
                            Cancel Edit
                          </button>
                        )}
                      </form>
                    </div>
 
                    {/* Categories List */}
                    <div>
                      <h3>Active System Categories</h3>
                      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {categories.map((cat) => (
                          <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--card-bg)", border: "1px solid var(--line)", borderRadius: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "18px" }}>{cat.icon || "🛍️"}</span>
                              <span style={{ width: "12px", height: "12px", background: categoryColors[cat.name] || cat.color || "#4f46e5", borderRadius: "50%", display: "inline-block" }}></span>
                              <strong style={{ color: "var(--ink)" }}>{cat.name}</strong>
                              <span className={`flow-status-pill ${cat.type === 'income' ? 'status-credit' : 'status-debit'}`} style={{ fontSize: "10px", padding: "2px 6px" }}>
                                {cat.type}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <button 
                                type="button"
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setNewCatName(cat.name);
                                  setNewCatType(cat.type);
                                  setNewCatColor(cat.color || "#4f46e5");
                                  setNewCatIcon(cat.icon || "🛍️");
                                }}
                                style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", display: "flex", alignItems: "center" }}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
                                    setCategories(prev => prev.filter(c => c.id !== cat.id));
                                    showToast(`Category "${cat.name}" deleted.`);
                                    appendActivity(`Deleted category "${cat.name}"`);
                                    if (editingCatId === cat.id) {
                                      setEditingCatId(null);
                                      setNewCatName("");
                                    }
                                  }
                                }} 
                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {categories.length === 0 && (
                          <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>No categories defined.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BUDGETS TAB */}
              {activeTab === 4 && (
                <div className="panel-card view-container-fade">
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div>
                      <h2 className="panel-title">
                        <Wallet className="inline-icon icon-sm text-green" /> Resource Allocation Threshold Management
                      </h2>
                      <p className="panel-subtitle">Plan and distribute income streams into specific category limits.</p>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {/* Weekly/Monthly Selector */}
                      <select 
                        className="dashboard-panel-select" 
                        style={{ width: "130px", height: "40px" }}
                        value={budgetCycle} 
                        onChange={(e) => setBudgetCycle(e.target.value)}
                      >
                        <option value="monthly">Monthly Cycle</option>
                        <option value="weekly">Weekly Cycle</option>
                      </select>
                      
                      <button
                        type="button"
                        className="profile-action-toggle-btn"
                        style={{ height: "40px" }}
                        onClick={() => {
                          if (isEditingBudget) {
                            handleSaveBudgets();
                          }
                          setIsEditingBudget(!isEditingBudget);
                        }}
                      >
                        {isEditingBudget ? "Commit Budgets" : "Modify Limits"}
                      </button>
                      
                      <button
                        type="button"
                        className="logout-btn"
                        style={{ background: "#64748b", height: "40px", padding: "0 16px" }}
                        onClick={() => {
                          if (confirm("Reset all budget categories to default baseline allocations?")) {
                            setHousingExpense(15000);
                            setFoodExpense(8000);
                            setTravelExpense(4000);
                            setUtilitiesExpense(5000);
                            setEntertainmentExpense(3000);
                            setSavingsExpense(10000);
                            showToast("Budgets reset to default baseline.");
                            appendActivity("Reset budget allocations to defaults");
                          }
                        }}
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>

                  <div className="budget-settings-workspace">
                    <div className="budget-form-side">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3>Adjust Spending Target Limits ({budgetCycle.toUpperCase()})</h3>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                          {budgetCycle === "weekly" ? "*Inputs represent monthly caps, scaled weekly below" : ""}
                        </span>
                      </div>
                      
                      <div className="budget-fields-vertical-stack">
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">
                            🏠 Housing Budget Cap (Monthly) {isTopCategory("Housing") && <span style={{color: "#3b82f6", fontWeight: "bold", fontSize: "11px", marginLeft: "6px"}}>⭐ High Priority</span>}
                          </label>
                          <input className="dashboard-panel-input" type="number" value={housingExpense} onChange={(e) => setHousingExpense(Number(e.target.value))} disabled={!isEditingBudget} />
                          {budgetCycle === "weekly" && <span style={{ fontSize: "11px", color: "var(--muted)" }}>Weekly Equivalent: {money(housingExpense / 4)}</span>}
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">
                            🍔 Food & Groceries Budget Cap (Monthly) {isTopCategory("Food") && <span style={{color: "#3b82f6", fontWeight: "bold", fontSize: "11px", marginLeft: "6px"}}>⭐ High Priority</span>}
                          </label>
                          <input className="dashboard-panel-input" type="number" value={foodExpense} onChange={(e) => setFoodExpense(Number(e.target.value))} disabled={!isEditingBudget} />
                          {budgetCycle === "weekly" && <span style={{ fontSize: "11px", color: "var(--muted)" }}>Weekly Equivalent: {money(foodExpense / 4)}</span>}
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">
                            🚗 Commute & Travel Budget Cap (Monthly) {isTopCategory("Transport") && <span style={{color: "#3b82f6", fontWeight: "bold", fontSize: "11px", marginLeft: "6px"}}>⭐ High Priority</span>}
                          </label>
                          <input className="dashboard-panel-input" type="number" value={travelExpense} onChange={(e) => setTravelExpense(Number(e.target.value))} disabled={!isEditingBudget} />
                          {budgetCycle === "weekly" && <span style={{ fontSize: "11px", color: "var(--muted)" }}>Weekly Equivalent: {money(travelExpense / 4)}</span>}
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">
                            ⚡ Household Utilities Budget Cap (Monthly) {isTopCategory("Utilities") && <span style={{color: "#3b82f6", fontWeight: "bold", fontSize: "11px", marginLeft: "6px"}}>⭐ High Priority</span>}
                          </label>
                          <input className="dashboard-panel-input" type="number" value={utilitiesExpense} onChange={(e) => setUtilitiesExpense(Number(e.target.value))} disabled={!isEditingBudget} />
                          {budgetCycle === "weekly" && <span style={{ fontSize: "11px", color: "var(--muted)" }}>Weekly Equivalent: {money(utilitiesExpense / 4)}</span>}
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">
                            🍿 Entertainment Budget Cap (Monthly) {isTopCategory("Entertainment") && <span style={{color: "#3b82f6", fontWeight: "bold", fontSize: "11px", marginLeft: "6px"}}>⭐ High Priority</span>}
                          </label>
                          <input className="dashboard-panel-input" type="number" value={entertainmentExpense} onChange={(e) => setEntertainmentExpense(Number(e.target.value))} disabled={!isEditingBudget} />
                          {budgetCycle === "weekly" && <span style={{ fontSize: "11px", color: "var(--muted)" }}>Weekly Equivalent: {money(entertainmentExpense / 4)}</span>}
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">
                            💰 Savings Investments Allocation (Monthly) {isTopCategory("Savings") && <span style={{color: "#3b82f6", fontWeight: "bold", fontSize: "11px", marginLeft: "6px"}}>⭐ High Priority</span>}
                          </label>
                          <input className="dashboard-panel-input" type="number" value={savingsExpense} onChange={(e) => setSavingsExpense(Number(e.target.value))} disabled={!isEditingBudget} />
                          {budgetCycle === "weekly" && <span style={{ fontSize: "11px", color: "var(--muted)" }}>Weekly Equivalent: {money(savingsExpense / 4)}</span>}
                        </div>
                      </div>

                      {/* Smart Recommendations */}
                      <div style={{ marginTop: "24px", padding: "16px", background: "var(--surface-soft)", borderRadius: "12px", border: "1px solid var(--line)" }}>
                        <h4>💡 Smart 50/30/20 Recommendation</h4>
                        <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                          Based on your monthly income of <strong>{money(monthlyIncome)}</strong>:
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "12px 0", fontSize: "12px" }}>
                          <div>Needs (50%): <strong>{money(monthlyIncome * 0.5)}</strong></div>
                          <div>Wants (30%): <strong>{money(monthlyIncome * 0.3)}</strong></div>
                          <div>Savings (20%): <strong>{money(monthlyIncome * 0.2)}</strong></div>
                        </div>
                        <button
                          type="button"
                          className="profile-action-toggle-btn"
                          style={{ width: "100%", justifyContent: "center", background: "var(--blue)", color: "#fff", border: "none" }}
                          onClick={() => {
                            const income = Number(monthlyIncome) || 50000;
                            // Needs: Housing 25%, Utilities 15%, Food 10%
                            setHousingExpense(Math.round(income * 0.25));
                            setUtilitiesExpense(Math.round(income * 0.15));
                            setFoodExpense(Math.round(income * 0.10));
                            // Wants: Entertainment 20%, Transport 10%
                            setEntertainmentExpense(Math.round(income * 0.20));
                            setTravelExpense(Math.round(income * 0.10));
                            // Savings: 20%
                            setSavingsExpense(Math.round(income * 0.20));
                            showToast("Applied 50/30/20 recommendations!");
                            appendActivity("Applied algorithmic 50/30/20 budget recommendations");
                          }}
                        >
                          Apply 50/30/20 Allocation
                        </button>
                      </div>
                    </div>

                    <div className="budget-analytics-visual-side">
                      <div className="info-alert-callout text-purple bg-purple-light" style={{padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #f3e8ff"}}>
                        <h4>Aggregated Spending Ceiling ({budgetCycle})</h4>
                        <p style={{fontSize: "24px", fontWeight: "700", margin: "8px 0"}}>
                          {budgetCycle === "weekly" ? money(aggregatedAllocatedBudgets / 4) : money(aggregatedAllocatedBudgets)}
                        </p>
                        <p style={{fontSize: "12px"}}>Baseline Disposable Allocation Buffer Remaining: <strong>{money(availableNetBalance)}</strong></p>
                      </div>

                      <h4 style={{marginBottom: "12px", fontSize: "14px", fontWeight: "600"}}>Active Boundary Usage Profiles ({budgetCycle})</h4>
                      {categoriesList.map((key) => {
                        const baseLimit = budgetLimitsMap[key] || 1;
                        const limit = budgetCycle === "weekly" ? baseLimit / 4 : baseLimit;
                        const spent = budgetCycle === "weekly" ? (dbSpentMap[key] || 0) / 4 : (dbSpentMap[key] || 0);
                        const ratio = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
                        const isHighPriority = isTopCategory(key);
                        return (
                          <div className="metric-row-card" key={key} style={{ marginBottom: "12px", borderLeft: isHighPriority ? "3px solid #3b82f6" : "none" }}>
                            <div className="metric-header">
                              <strong>{key} Pool {isHighPriority && <span style={{color: "#3b82f6", fontSize: "10px"}}>⭐</span>}</strong>
                              <span>{money(spent)} / {money(limit)}</span>
                            </div>
                            <div className="progress-bar-track">
                              <div className="progress-bar-fill" style={{ width: `${ratio}%`, background: (ratio > 90 && overspendingAlerts) ? "#dc2626" : "#3b82f6" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* REPORTS & ANALYTICS TAB */}
              {activeTab === 5 && (
                <div className="view-container-fade" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                  <div className="panel-card">
                    <h2 className="panel-title"><BarChart2 className="inline-icon icon-sm text-purple" /> Algorithmic Accounting & Verification Reports</h2>
                    <p className="panel-subtitle">Custom mathematical visualization dashboards tracing funds flow and targets.</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                    {/* SVG Pie/Donut Chart */}
                    <div className="panel-card">
                      <h3>Expenditures Category Density</h3>
                      <p className="panel-subtitle" style={{marginBottom: "15px"}}>Segment percentage metrics representation.</p>
                      {renderDonutChart()}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "15px" }}>
                        {categoriesList.map(c => (
                          <div key={c} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                            <span style={{ width: "8px", height: "8px", background: categoryColors[c], borderRadius: "50%" }}></span>
                            <span>{c}: {money(dbSpentMap[c] || 0).split('.')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SVG Line Weekly spending trends */}
                    <div className="panel-card">
                      <h3>Weekly Spending Trajectory</h3>
                      <p className="panel-subtitle" style={{marginBottom: "15px"}}>Outflows timeline mapped over last 7 days.</p>
                      {renderWeeklyLineChart()}
                    </div>

                    {/* SVG Bar budget vs actual compare */}
                    <div className="panel-card" style={{ gridColumn: "span 2" }}>
                      <h3>Allocations Cap vs Live Expenditures Comparison</h3>
                      <p className="panel-subtitle" style={{marginBottom: "15px"}}>Limits bar (left / Indigo) and Spent bar (right / Green/Red) side-by-side.</p>
                      {renderCompareBarChart()}
                    </div>
                  </div>

                  <div className="panel-card">
                    <h3>Workspace Survey Insights summary</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "16px" }}>
                      <div style={{ padding: "16px", background: "var(--surface-soft)", borderRadius: "12px" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>Employment Profile</span>
                        <p style={{ fontSize: "14px", marginTop: "8px" }}>Occupation: <strong style={{ textTransform: "capitalize" }}>{occupation}</strong></p>
                        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>Income Frequency: <strong style={{ textTransform: "capitalize" }}>{incomeFrequency}</strong></p>
                        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>Primary Income: <strong>{primaryIncomeSource || "Not specified"}</strong></p>
                      </div>

                      <div style={{ padding: "16px", background: "var(--surface-soft)", borderRadius: "12px" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>Financial Targets</span>
                        <p style={{ fontSize: "14px", marginTop: "8px" }}>Primary Goal: <strong>{financialGoal}</strong></p>
                        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>Saving Target Category: <strong>{savingFor}</strong></p>
                        <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>Priority Categories: <strong>{topSpendingCategories || "None"}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GOALS & SAVINGS TAB */}
              {activeTab === 6 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header">
                    <div>
                      <h2 className="panel-title">
                        <PiggyBank className="inline-icon icon-sm text-blue" /> Savings & Financial Goals Tracker
                      </h2>
                      <p className="panel-subtitle">Define target amounts, deadlines, and monitor your savings progress milestones.</p>
                    </div>
                  </div>
                  
                  <div className="goals-workspace" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginTop: "24px" }}>
                    {/* Goal Creator Form */}
                    <div style={{ background: "var(--surface-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                      <h3>Create New Savings Goal</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newGoalName.trim() || !newGoalTarget || !newGoalDeadline) return;
                        const nextId = savingsGoals.length > 0 ? Math.max(...savingsGoals.map(g => g.id)) + 1 : 1;
                        const targetNum = Number(newGoalTarget);
                        const currentNum = Number(newGoalCurrent) || 0;
                        const newGoal = {
                          id: nextId,
                          name: newGoalName.trim(),
                          target: targetNum,
                          current: currentNum,
                          deadline: newGoalDeadline
                        };
                        setSavingsGoals(prev => [...prev, newGoal]);
                        setNewGoalName("");
                        setNewGoalTarget("");
                        setNewGoalCurrent("");
                        setNewGoalDeadline("");
                        showToast(`Savings goal "${newGoalName}" established.`);
                        appendActivity(`Established savings goal: "${newGoalName}" (Target: ${money(targetNum)})`);
                      }} style={{ marginTop: "16px" }}>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Goal Label Description</label>
                          <input 
                            className="dashboard-panel-input" 
                            type="text" 
                            placeholder="e.g. Buy a Car, Emergency Fund" 
                            value={newGoalName} 
                            onChange={(e) => setNewGoalName(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Target Amount (Rs.)</label>
                          <input 
                            className="dashboard-panel-input" 
                            type="number" 
                            placeholder="0.00" 
                            value={newGoalTarget} 
                            onChange={(e) => setNewGoalTarget(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Current Saved Amount (Rs.)</label>
                          <input 
                            className="dashboard-panel-input" 
                            type="number" 
                            placeholder="0.00" 
                            value={newGoalCurrent} 
                            onChange={(e) => setNewGoalCurrent(e.target.value)} 
                          />
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Deadline Date Target</label>
                          <input 
                            className="dashboard-panel-input" 
                            type="date" 
                            value={newGoalDeadline} 
                            onChange={(e) => setNewGoalDeadline(e.target.value)} 
                            required 
                          />
                        </div>
                        <button type="submit" className="setup-submit-btn" style={{ width: "100%", marginTop: "16px" }}>
                          Add Target Goal
                        </button>
                      </form>
                    </div>

                    {/* Goal list progress view */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h3>Active Target Goals</h3>
                      <div style={{ overflowY: "auto", maxHeight: "450px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        {savingsGoals.map((g) => {
                          const ratio = g.target > 0 ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
                          const isAchieved = ratio >= 100;
                          return (
                            <div key={g.id} style={{ background: "var(--card-bg)", border: "1px solid var(--line)", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                              <div style={{ display: "flex", justify: "space-between", align: "flex-start" }}>
                                <div>
                                  <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px" }}>
                                    {g.name} 
                                    {isAchieved && <span className="flow-status-pill status-credit" style={{ fontSize: "10px", padding: "2px 6px" }}>🏆 Achieved!</span>}
                                  </h4>
                                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>Deadline: {new Date(g.deadline).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                  <button 
                                    type="button" 
                                    disabled={isAchieved}
                                    onClick={() => {
                                      const incrementStr = prompt(`Enter amount to add to "${g.name}":`, "1000");
                                      const increment = Number(incrementStr);
                                      if (isNaN(increment) || increment <= 0) return;
                                      setSavingsGoals(prev => prev.map(item => item.id === g.id ? { ...item, current: item.current + increment } : item));
                                      setSavingsHistory(prevHist => [
                                        { id: Date.now(), goalName: g.name, amount: increment, date: new Date().toISOString() },
                                        ...prevHist
                                      ]);
                                      showToast(`Deposited ${money(increment)} to "${g.name}".`);
                                      appendActivity(`Updated savings goal "${g.name}": added ${money(increment)}`);
                                    }} 
                                    style={{ padding: "4px 8px", background: isAchieved ? "#f1f5f9" : "var(--surface-soft)", color: isAchieved ? "#94a3b8" : "var(--ink)", border: "1px solid var(--line)", borderRadius: "4px", fontSize: "11px", cursor: isAchieved ? "default" : "pointer", fontWeight: "600" }}
                                  >
                                    + Save
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete savings goal "${g.name}"?`)) {
                                        setSavingsGoals(prev => prev.filter(item => item.id !== g.id));
                                        showToast(`Goal "${g.name}" deleted.`);
                                        appendActivity(`Deleted savings goal "${g.name}"`);
                                      }
                                    }} 
                                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <div style={{ display: "flex", justify: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                                  <span>Progress: {ratio}%</span>
                                  <strong>{money(g.current)} / {money(g.target)}</strong>
                                </div>
                                <div className="progress-bar-track" style={{ height: "10px" }}>
                                  <div className="progress-bar-fill" style={{ width: `${ratio}%`, background: ratio >= 100 ? "#10b981" : "#3b82f6" }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {savingsGoals.length === 0 && (
                          <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>No goals defined.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Savings History Log */}
                  <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--line)" }}>
                    <h3>Savings Deposit History Logs</h3>
                    <div className="table-scroll-frame" style={{ marginTop: "16px" }}>
                      <table className="enterprise-data-table">
                        <thead>
                          <tr>
                            <th>Goal Target</th>
                            <th>Amount Deposited</th>
                            <th>Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savingsHistory.map((log) => (
                            <tr key={log.id}>
                              <td><strong>{log.goalName}</strong></td>
                              <td style={{ color: "#16a34a", fontWeight: "700" }}>+ {money(log.amount)}</td>
                              <td>{new Date(log.date).toLocaleString()}</td>
                            </tr>
                          ))}
                          {savingsHistory.length === 0 && (
                            <tr>
                              <td colSpan="3" style={{ textAlign: "center", padding: "16px", color: "var(--muted)" }}>
                                No savings history logged.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 7 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 className="panel-title">
                        <Bell className="inline-icon icon-sm text-yellow" /> System Alerts & Notifications Log
                      </h2>
                      <p className="panel-subtitle">Audited events tracking system access, budget warning boundaries, and alerts.</p>
                    </div>
                    <button 
                      type="button" 
                      className="profile-action-toggle-btn"
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        showToast("All notifications marked as read.");
                      }}
                    >
                      Mark All Read
                    </button>
                  </div>

                  <div className="notifications-list-wrapper" style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: n.read ? "var(--card-bg)" : "var(--surface-soft)", border: "1px solid var(--line)", borderRadius: "10px", borderLeft: n.read ? "1px solid var(--line)" : "4px solid #3b82f6" }}>
                        <div>
                          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px" }}>
                            {n.title} {!n.read && <span style={{ width: "6px", height: "6px", background: "#3b82f6", borderRadius: "50%" }}></span>}
                          </h4>
                          <p style={{ fontSize: "13px", color: "var(--ink)", marginTop: "4px" }}>{n.message}</p>
                          <span style={{ fontSize: "11px", color: "var(--muted)", display: "block", marginTop: "6px" }}>{new Date(n.date).toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                          {!n.read && (
                            <button 
                              type="button" 
                              onClick={() => {
                                  setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                                  showToast("Notification marked as read.");
                              }} 
                              style={{ padding: "4px 8px", background: "none", border: "1px solid var(--line)", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                            >
                              Mark Read
                            </button>
                          )}
                          <button 
                            type="button" 
                            onClick={() => {
                              setNotifications(prev => prev.filter(item => item.id !== n.id));
                              showToast("Notification dismissed.");
                            }} 
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>No notifications logged.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 8 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header">
                    <div>
                      <h2 className="panel-title">
                        <FileSpreadsheet className="inline-icon icon-sm text-green" /> Export Financial Data Statements
                      </h2>
                      <p className="panel-subtitle">Download transaction histories and budget logs in machine-readable and print formats.</p>
                    </div>
                  </div>
                  
                  {/* Export Filters Grid */}
                  <div style={{ background: "var(--surface-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)", marginBottom: "24px" }}>
                    <h3>Configure Export Scope</h3>
                    <p className="panel-subtitle" style={{ marginBottom: "16px" }}>Refine the transactions to include in your exported files.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                      <div className="dashboard-input-group" style={{ marginBottom: 0 }}>
                        <label className="dashboard-input-label">Start Date</label>
                        <input type="date" className="dashboard-panel-input" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} />
                      </div>
                      <div className="dashboard-input-group" style={{ marginBottom: 0 }}>
                        <label className="dashboard-input-label">End Date</label>
                        <input type="date" className="dashboard-panel-input" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} />
                      </div>
                      <div className="dashboard-input-group" style={{ marginBottom: 0 }}>
                        <label className="dashboard-input-label">Transaction Type</label>
                        <select className="dashboard-panel-select" value={exportType} onChange={(e) => setExportType(e.target.value)}>
                          <option value="">All Types</option>
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>
                      <div className="dashboard-input-group" style={{ marginBottom: 0 }}>
                        <label className="dashboard-input-label">Category</label>
                        <select className="dashboard-panel-select" value={exportCategory} onChange={(e) => setExportCategory(e.target.value)}>
                          <option value="">All Categories</option>
                          {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                    <div style={{ background: "var(--surface-soft)", padding: "24px", borderRadius: "12px", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <h3>Comma-Separated Values (CSV)</h3>
                      <p style={{ fontSize: "13px", color: "var(--muted)", flexGrow: 1 }}>Best for importing statement data into databases, spreadsheets, or third-party accounting applications.</p>
                      <button className="setup-submit-btn" style={{ margin: 0, width: "100%" }} onClick={exportToCSV}>
                        Download Statement .csv
                      </button>
                    </div>

                    <div style={{ background: "var(--surface-soft)", padding: "24px", borderRadius: "12px", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <h3>Microsoft Excel Spreadsheet (.xls)</h3>
                      <p style={{ fontSize: "13px", color: "var(--muted)", flexGrow: 1 }}>Clean spreadsheet format containing columns for direct importing, sorting, and reporting within Excel.</p>
                      <button className="setup-submit-btn" style={{ margin: 0, width: "100%", background: "#10b981" }} onClick={exportToExcel}>
                        Download Spreadsheet .xls
                      </button>
                    </div>

                    <div style={{ background: "var(--surface-soft)", padding: "24px", borderRadius: "12px", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <h3>Print Document Format (PDF)</h3>
                      <p style={{ fontSize: "13px", color: "var(--muted)", flexGrow: 1 }}>Perfect for printing physical copies or generating clean summaries of incomes, expenses, and current balance variables.</p>
                      <button className="setup-submit-btn" style={{ margin: 0, width: "100%", background: "#ef4444" }} onClick={exportToPDF}>
                        Generate PDF Statement
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 9 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header">
                    <div>
                      <h2 className="panel-title"><User className="inline-icon icon-sm text-teal" /> Personal Identity Profile Registry</h2>
                      <p className="panel-subtitle">Manage system details, secure credentials, and workspace settings.</p>
                    </div>
                    <button type="button" className="profile-action-toggle-btn" onClick={(e) => {
                      if (isEditingProfile) {
                        handleSaveProfile(e);
                      } else {
                        setIsEditingProfile(true);
                      }
                    }}>
                      {isEditingProfile ? "Save Profile" : "Edit Profile"}
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="profile-workspace-form" style={{marginTop: "24px"}}>
                    <div className="profile-avatar-banner-block" style={{display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '24px', borderBottom: '1px solid var(--line)', marginBottom: '24px'}}>
                      <div className="profile-image-frame-placeholder" style={{width: '70px', height: '70px', borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700'}}>
                        {profileName ? profileName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h3 style={{fontSize: '18px', fontWeight: '600', color: "var(--ink)"}}>{profileName}</h3>
                        <p style={{fontSize: '13px', color: 'var(--muted)'}}>Identity Code: <code style={{background: 'var(--surface-soft)', padding: '2px 6px', borderRadius: '4px'}}>USR-{userId}</code></p>
                      </div>
                    </div>

                    <div className="setup-grid-fields">
                      <div className="dashboard-input-group">
                        <label className="dashboard-input-label">Identity Full Name</label>
                        <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} disabled={!isEditingProfile} className={`dashboard-panel-input ${!isEditingProfile ? "disabled-profile-input" : ""}`} required />
                      </div>

                      <div className="dashboard-input-group">
                        <label className="dashboard-input-label">Username / Email</label>
                        <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} disabled={!isEditingProfile} className={`dashboard-panel-input ${!isEditingProfile ? "disabled-profile-input" : ""}`} required />
                      </div>

                      <div className="dashboard-input-group">
                        <label className="dashboard-input-label">Phone Connection Number</label>
                        <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} disabled={!isEditingProfile} className={`dashboard-panel-input ${!isEditingProfile ? "disabled-profile-input" : ""}`} required />
                      </div>

                      <div className="dashboard-input-group">
                        <label className="dashboard-input-label">Birth Timestamp (D.O.B)</label>
                        <input type="date" value={profileDob} onChange={(e) => setProfileDob(e.target.value)} disabled={!isEditingProfile} className={`dashboard-panel-input ${!isEditingProfile ? "disabled-profile-input" : ""}`} required />
                      </div>

                      <div className="dashboard-input-group">
                        <label className="dashboard-input-label">Currency Room Symbol</label>
                        <select value={profileCurrency} onChange={(e) => setProfileCurrency(e.target.value)} disabled={!isEditingProfile} className={`dashboard-panel-select ${!isEditingProfile ? "disabled-profile-input" : ""}`}>
                          <option value="INR">INR (Rupee)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                        </select>
                      </div>
                    </div>
                  </form>

                  <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--line)" }}>
                    <h3>Change Password</h3>
                    <form onSubmit={handlePasswordChange} style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
                      <div className="dashboard-input-group" style={{ marginBottom: 0 }}>
                        <label className="dashboard-input-label">Current Password</label>
                        <input type="password" value={currentPasswordVal} onChange={(e) => setCurrentPasswordVal(e.target.value)} className="dashboard-panel-input" required />
                      </div>
                      <div className="dashboard-input-group" style={{ marginBottom: 0 }}>
                        <label className="dashboard-input-label">New Password</label>
                        <input type="password" value={newPasswordVal} onChange={(e) => setNewPasswordVal(e.target.value)} className="dashboard-panel-input" required />
                      </div>
                      <div className="dashboard-input-group" style={{ marginBottom: 0 }}>
                        <label className="dashboard-input-label">Confirm New Password</label>
                        <input type="password" value={confirmNewPasswordVal} onChange={(e) => setConfirmNewPasswordVal(e.target.value)} className="dashboard-panel-input" required />
                      </div>
                      <button type="submit" className="profile-action-toggle-btn change-pass-submit" style={{ height: "48px" }} disabled={changingPassword}>
                        {changingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  </div>

                  <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px dashed #ef4444" }}>
                    <h3 style={{ color: "#ef4444" }}>Danger Zone</h3>
                    <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>Permanently delete your account and all associated transaction records. This action is irreversible.</p>
                    <button 
                      type="button" 
                      onClick={async () => {
                        if (confirm("WARNING: Are you sure you want to permanently delete your account? This will erase all user details, budgets, and transactions.")) {
                          try {
                            setLoading(true);
                            const res = await fetch(`${GATEWAY_URL}/api/users/${userId}`, {
                              method: "DELETE",
                              headers: { "Authorization": `Bearer ${token}` }
                            });
                            if (res.ok) {
                              showToast("Your account has been deleted.");
                              handleLogout();
                            } else {
                              showToast("Failed to delete account.", "error");
                            }
                          } catch (err) {
                            console.error(err);
                            showToast("Error connecting to server.", "error");
                          } finally {
                            setLoading(false);
                          }
                        }
                      }} 
                      className="logout-btn" 
                      style={{ marginTop: "12px", background: "#ef4444" }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 10 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header">
                    <div>
                      <h2 className="panel-title"><Settings className="inline-icon icon-sm text-indigo" /> Workspace Settings</h2>
                      <p className="panel-subtitle">Customize language, currency Room formatting, notifications, and accessibility options.</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginTop: "24px" }}>
                    {/* Appearance & Language */}
                    <div style={{ background: "var(--surface-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                      <h3>Appearance & Interface</h3>
                      
                      <div className="dashboard-input-group" style={{ marginTop: "16px" }}>
                        <label className="dashboard-input-label">Language Preference</label>
                        <select className="dashboard-panel-select" value={selectedLanguage} onChange={(e) => {
                          setSelectedLanguage(e.target.value);
                          localStorage.setItem("selectedLanguage", e.target.value);
                          showToast(`Language changed to ${e.target.value}`);
                        }}>
                          <option value="English">English</option>
                          <option value="Telugu">Telugu</option>
                          <option value="Hindi">Hindi</option>
                        </select>
                      </div>

                      <div className="dashboard-input-group">
                        <label className="dashboard-input-label">Preferred Currency</label>
                        <select className="dashboard-panel-select" value={profileCurrency || currency} onChange={(e) => {
                          setCurrency(e.target.value);
                          setProfileCurrency(e.target.value);
                          showToast(`Currency updated to ${e.target.value}`);
                        }}>
                          <option value="INR">INR (Rs. - Indian Rupee)</option>
                          <option value="USD">USD ($ - US Dollar)</option>
                          <option value="EUR">EUR (€ - Euro)</option>
                        </select>
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div style={{ background: "var(--surface-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                      <h3>Notification Preferences</h3>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                          <input type="checkbox" checked={emailAlerts} onChange={(e) => {
                            setEmailAlerts(e.target.checked);
                            localStorage.setItem("emailAlerts", e.target.checked);
                          }} />
                          Enable Email Alerts
                        </label>
                        
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                          <input type="checkbox" checked={pushNotifications} onChange={(e) => {
                            setPushNotifications(e.target.checked);
                            localStorage.setItem("pushNotifications", e.target.checked);
                          }} />
                          Enable Push Notifications
                        </label>
                      </div>
                    </div>

                    {/* Security & Accessibility */}
                    <div style={{ background: "var(--surface-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                      <h3>Security & Accessibility</h3>
                      
                      <div className="dashboard-input-group" style={{ marginTop: "16px" }}>
                        <label className="dashboard-input-label">Font Size</label>
                        <select className="dashboard-panel-select" value={accessibilityFontSize} onChange={(e) => {
                          setAccessibilityFontSize(e.target.value);
                          localStorage.setItem("accessibilityFontSize", e.target.value);
                          showToast(`Font size set to ${e.target.value}`);
                        }}>
                          <option value="small">Small</option>
                          <option value="medium">Medium (Default)</option>
                          <option value="large">Large</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                          <input type="checkbox" checked={accessibilityCompactMode} onChange={(e) => {
                            setAccessibilityCompactMode(e.target.checked);
                            localStorage.setItem("accessibilityCompactMode", e.target.checked);
                            showToast(e.target.checked ? "Compact mode active" : "Normal layout active");
                          }} />
                          Enable Compact Mode
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                          <input type="checkbox" checked={enableTwoFactor} onChange={(e) => {
                            setEnableTwoFactor(e.target.checked);
                            showToast(e.target.checked ? "Two-Factor Auth Enabled" : "Two-Factor Auth Disabled");
                          }} />
                          Enable 2FA (Two-Factor Authentication)
                        </label>
                      </div>

                      <div className="dashboard-input-group" style={{ marginTop: "12px" }}>
                        <label className="dashboard-input-label">Session Timeout</label>
                        <select className="dashboard-panel-select" value={sessionTimeoutVal} onChange={(e) => {
                          setSessionTimeoutVal(e.target.value);
                          localStorage.setItem("sessionTimeoutVal", e.target.value);
                        }}>
                          <option value="5 min">5 Minutes</option>
                          <option value="15 min">15 Minutes</option>
                          <option value="30 min">30 Minutes</option>
                          <option value="logoutAll">Logout from all devices</option>
                        </select>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => {
                          showToast("Logged out of all other active sessions.");
                          appendActivity("Triggered global logout of other devices");
                        }} 
                        className="profile-action-toggle-btn" 
                        style={{ width: "100%", marginTop: "12px", justifyContent: "center" }}
                      >
                        Logout other devices
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CALENDAR TAB */}
              {activeTab === 11 && (() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                
                const firstDayIndex = new Date(year, month, 1).getDay();
                const totalDays = new Date(year, month + 1, 0).getDate();
                const prevTotalDays = new Date(year, month, 0).getDate();
                
                const cells = [];
                for (let i = firstDayIndex - 1; i >= 0; i--) {
                  cells.push({ day: prevTotalDays - i, isCurrentMonth: false, dateKey: `${year}-${String(month).padStart(2, '0')}-${String(prevTotalDays - i).padStart(2, '0')}` });
                }
                for (let i = 1; i <= totalDays; i++) {
                  cells.push({ day: i, isCurrentMonth: true, dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
                }
                const totalCells = cells.length;
                const remainingCells = 42 - totalCells;
                for (let i = 1; i <= remainingCells; i++) {
                  cells.push({ day: i, isCurrentMonth: false, dateKey: `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
                }

                const selectedDayTransactions = userTransactions.filter(t => new Date(t.date).toISOString().split('T')[0] === selectedDate);
                const selectedDayBills = bills.filter(b => b.dueDate === selectedDate);

                return (
                  <div className="panel-card view-container-fade calendar-container">
                    <div className="panel-header border-bottom-header">
                      <div>
                        <h2 className="panel-title"><Calendar className="inline-icon icon-sm text-blue" /> Monthly Ledger Calendar</h2>
                        <p className="panel-subtitle">Visual overview of expenses, inflows, and due bills across this month.</p>
                      </div>
                      <h3>{monthNames[month]} {year}</h3>
                    </div>

                    <div className="calendar-weekdays">
                      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>

                    <div className="calendar-grid">
                      {cells.map((cell, idx) => {
                        const cellTxs = userTransactions.filter(t => new Date(t.date).toISOString().split('T')[0] === cell.dateKey);
                        const cellBills = bills.filter(b => b.dueDate === cell.dateKey);
                        
                        const spentVal = cellTxs.filter(t => t.type === "expense").reduce((s, c) => s + c.amount, 0);
                        const incomeVal = cellTxs.filter(t => t.type === "income").reduce((s, c) => s + c.amount, 0);
                        const isSelected = selectedDate === cell.dateKey;
                        const isToday = new Date().toISOString().split('T')[0] === cell.dateKey;

                        return (
                          <div 
                            key={idx} 
                            onClick={() => cell.isCurrentMonth && setSelectedDate(cell.dateKey)}
                            className={`calendar-day-cell ${cell.isCurrentMonth ? "current-month" : "other-month"} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                          >
                            <span className="calendar-day-number">{cell.day}</span>
                            <div className="calendar-day-indicator-dots">
                              {spentVal > 0 && <span className="calendar-dot expense"></span>}
                              {incomeVal > 0 && <span className="calendar-dot income"></span>}
                              {cellBills.length > 0 && <span className="calendar-dot bill"></span>}
                            </div>
                            <div style={{ marginTop: "auto", fontSize: "10px", textAlign: "right" }}>
                              {spentVal > 0 && <span style={{ color: "#dc2626", fontWeight: "700", display: "block" }}>-{money(spentVal).split('.')[0]}</span>}
                              {incomeVal > 0 && <span style={{ color: "#16a34a", fontWeight: "700", display: "block" }}>+{money(incomeVal).split('.')[0]}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: "24px", background: "var(--surface-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                      <h3>Agenda Details: {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                      
                      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {selectedDayBills.map(b => (
                          <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--card-bg)", borderLeft: "4px solid #ea580c", borderRadius: "6px" }}>
                            <div>
                              <strong>⏰ Bill Due: {b.name}</strong>
                              <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "8px" }}>({b.category})</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <strong>{money(b.amount)}</strong>
                              <span className={`bill-due-tag ${b.status}`}>{b.status.toUpperCase()}</span>
                            </div>
                          </div>
                        ))}

                        {selectedDayTransactions.map((t, idx) => (
                          <div key={t._id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--card-bg)", borderLeft: t.type === 'income' ? "4px solid #16a34a" : "4px solid #dc2626", borderRadius: "6px" }}>
                            <div>
                              <strong>{t.description ? t.description.split("|")[0].trim() : t.name}</strong>
                              <span className="category-capsule-tag" style={{ marginLeft: "8px" }}>{t.category}</span>
                            </div>
                            <strong className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                              {t.type === 'income' ? `+ ${money(t.amount)}` : `- ${money(t.amount)}`}
                            </strong>
                          </div>
                        ))}

                        {selectedDayTransactions.length === 0 && selectedDayBills.length === 0 && (
                          <div style={{ textAlign: "center", color: "var(--muted)", padding: "12px" }}>No items scheduled on this day.</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ACCOUNTS TAB */}
              {activeTab === 12 && (() => {
                const handleTransfer = (e) => {
                  e.preventDefault();
                  const amt = Number(transferAmount);
                  if (isNaN(amt) || amt <= 0) {
                    showToast("Please enter a valid transfer amount", "error");
                    return;
                  }

                  const sourceAcc = accounts.find(a => a.id === transferSource);
                  if (!sourceAcc || sourceAcc.balance < amt) {
                    showToast("Insufficient funds in source account", "error");
                    return;
                  }

                  setAccounts(prev => prev.map(acc => {
                    if (acc.id === transferSource) {
                      return { ...acc, balance: acc.balance - amt };
                    }
                    if (acc.id === transferDest) {
                      return { ...acc, balance: acc.balance + amt };
                    }
                    return acc;
                  }));

                  const sourceName = accounts.find(a => a.id === transferSource)?.name || transferSource;
                  const destName = accounts.find(a => a.id === transferDest)?.name || transferDest;
                  
                  showToast(`Successfully transferred ${money(amt)} from ${sourceName} to ${destName}`);
                  appendActivity(`Transferred ${money(amt)} from ${sourceName} to ${destName}`);
                  
                  setTransferAmount("");
                  setShowTransferModal(false);
                };

                const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
                const activeAccounts = accounts.filter(a => a.balance > 0).length;
                const selectedAccStmt = accountStatements[selectedAccount] || [];
                const selectedAccObj = accounts.find(a => a.id === selectedAccount);

                return (
                  <div className="view-container-fade" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    {/* Summary Cards */}
                    <div className="stats-grid">
                      <div className="stats-card">
                        <p className="card-label">Total Balance</p>
                        <p className="card-value">{money(totalBalance)}</p>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>Across all accounts</span>
                      </div>
                      <div className="stats-card">
                        <p className="card-label">Active Accounts</p>
                        <p className="card-value" style={{ color: "#0ea5e9" }}>{activeAccounts}</p>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{accounts.length} total accounts</span>
                      </div>
                      <div className="stats-card">
                        <p className="card-label">Credit Utilization</p>
                        <p className="card-value" style={{ color: "#f97316" }}>{((accounts.find(a => a.type === "credit")?.balance || 0) / -5000 * 100).toFixed(0)}%</p>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>Of credit limit</span>
                      </div>
                    </div>

                    {/* Account Cards */}
                    <div className="panel-card">
                      <div className="panel-header border-bottom-header">
                        <div>
                          <h2 className="panel-title"><CreditCard className="inline-icon icon-sm text-teal" /> Your Accounts</h2>
                          <p className="panel-subtitle">View and manage all your financial accounts in one place.</p>
                        </div>
                        <button className="setup-submit-btn" style={{ width: "auto", margin: 0, padding: "0 20px" }} onClick={() => setShowTransferModal(true)}>
                          Transfer Funds
                        </button>
                      </div>

                      <div className="accounts-grid">
                        {accounts.map(acc => (
                          <div 
                            key={acc.id} 
                            className={`account-card ${acc.type}`}
                            onClick={() => setSelectedAccount(acc.id)}
                            style={{ cursor: 'pointer', border: selectedAccount === acc.id ? '2px solid #4f46e5' : '1px solid transparent' }}
                          >
                            <div className="account-card-header">
                              <span className="account-card-name">{acc.name}</span>
                              <Wallet size={20} style={{ opacity: 0.8 }} />
                            </div>
                            <h3 className="account-card-balance">{money(acc.balance)}</h3>
                            <span className="account-card-number">{acc.number}</span>
                            <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px", display: "block" }}>
                              {acc.type === "credit" ? "Credit Card" : acc.type === "bank" ? "Bank Account" : acc.type === "upi" ? "Digital Wallet" : "Cash"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Account Statement */}
                    <div className="panel-card">
                      <div className="panel-header border-bottom-header">
                        <div>
                          <h2 className="panel-title"><List className="inline-icon icon-sm text-blue" /> Statement: {selectedAccObj?.name}</h2>
                          <p className="panel-subtitle">Detailed transaction history for this account.</p>
                        </div>
                      </div>

                      <div style={{ marginTop: "16px" }}>
                        <table className="enterprise-data-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Description</th>
                              <th>Type</th>
                              <th style={{textAlign: 'right'}}>Amount</th>
                              <th style={{textAlign: 'right'}}>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedAccStmt.map((stmt, idx) => (
                              <tr key={idx}>
                                <td>{stmt.date}</td>
                                <td><strong>{stmt.description}</strong></td>
                                <td>
                                  <span style={{
                                    background: stmt.amount > 0 ? "#d1fae5" : "#fee2e2",
                                    color: stmt.amount > 0 ? "#065f46" : "#7f1d1d",
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                  }}>
                                    {stmt.amount > 0 ? "Credit" : "Debit"}
                                  </span>
                                </td>
                                <td style={{textAlign: 'right', fontWeight: '600', color: stmt.amount > 0 ? '#16a34a' : '#dc2626'}}>
                                  {stmt.amount > 0 ? '+' : ''}{money(stmt.amount)}
                                </td>
                                <td style={{textAlign: 'right', fontWeight: '600'}}>{money(stmt.balance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {selectedAccStmt.length === 0 && (
                          <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                            No transactions for this account
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transfer Modal */}
                    {showTransferModal && (
                      <div className="modal-overlay">
                        <div className="panel-card" style={{ width: "100%", maxWidth: "440px" }}>
                          <h2 className="panel-title" style={{ marginBottom: "16px" }}>Execute Funds Transfer</h2>
                          <form onSubmit={handleTransfer}>
                            <div className="dashboard-input-group">
                              <label className="dashboard-input-label">Source Account</label>
                              <select className="dashboard-panel-select" value={transferSource} onChange={(e) => setTransferSource(e.target.value)}>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({money(a.balance)})</option>)}
                              </select>
                            </div>
                            <div className="dashboard-input-group">
                              <label className="dashboard-input-label">Destination Account</label>
                              <select className="dashboard-panel-select" value={transferDest} onChange={(e) => setTransferDest(e.target.value)}>
                                {accounts.filter(a => a.id !== transferSource).map(a => <option key={a.id} value={a.id}>{a.name} ({money(a.balance)})</option>)}
                              </select>
                            </div>
                            <div className="dashboard-input-group">
                              <label className="dashboard-input-label">Amount to Transfer</label>
                              <input className="dashboard-panel-input" type="number" placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} required />
                            </div>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "20px" }}>
                              <button type="button" className="profile-action-toggle-btn" onClick={() => setShowTransferModal(false)}>Cancel</button>
                              <button type="submit" className="setup-submit-btn" style={{ width: "auto", margin: 0, padding: "0 24px" }}>Execute Transfer</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* BILLS & SUBSCRIPTIONS TAB */}
              {activeTab === 13 && (() => {
                const handleAddBill = (e) => {
                  e.preventDefault();
                  if (!billName || !billAmount || !billDate) return;
                  const newBill = {
                    id: bills.length + 1,
                    name: billName,
                    amount: Number(billAmount),
                    category: billCategory,
                    dueDate: billDate,
                    paymentMethod: billAccount,
                    status: "unpaid"
                  };
                  setBills(prev => [...prev, newBill]);
                  setBillName("");
                  setBillAmount("");
                  setBillDate("");
                  setShowAddBillModal(false);
                  showToast(`Added upcoming bill: ${billName}`);
                  appendActivity(`Logged upcoming bill subscription: ${billName} (${money(Number(billAmount))})`);
                };

                const handlePayBill = async (billId) => {
                  const bill = bills.find(b => b.id === billId);
                  if (!bill) return;

                  if (bill.status === "paid") {
                    showToast("Bill is already paid!", "error");
                    return;
                  }

                  const acc = accounts.find(a => a.name.toLowerCase() === bill.paymentMethod.toLowerCase() || a.id.toLowerCase() === bill.paymentMethod.toLowerCase() || (bill.paymentMethod === "Credit Card" && a.id === "credit") || (bill.paymentMethod === "Bank Account" && a.id === "bank") || (bill.paymentMethod === "UPI Account" && a.id === "upi"));
                  if (acc && acc.type !== "credit" && acc.balance < bill.amount) {
                    showToast(`Insufficient balance in ${bill.paymentMethod} to pay this bill!`, "error");
                    return;
                  }

                  try {
                    const response = await fetch(`${GATEWAY_URL}/api/transactions`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: Number(userId),
                        name: `Bill Subscription: ${bill.name}`,
                        amount: bill.amount,
                        date: new Date().toISOString(),
                        type: "expense",
                        category: bill.category,
                        description: `Bill Subscription: ${bill.name} | Method: ${bill.paymentMethod}`
                      })
                    });
                    if (response.ok) {
                      updateAccountBalance(bill.paymentMethod, bill.amount, "expense");
                      await syncBudgetSpentAggregate(bill.category, bill.amount, "expense");

                      setBills(prev => prev.map(b => b.id === billId ? { ...b, status: "paid" } : b));
                      showToast(`Bill payment for ${bill.name} successfully finalized.`);
                      appendActivity(`Paid subscription bill: "${bill.name}" (-${money(bill.amount)})`);
                      fetchTransactions();
                    } else {
                      showToast("Server rejected bill payment transaction", "error");
                    }
                  } catch (err) {
                    console.error(err);
                    showToast("Network error paying bill", "error");
                  }
                };

                const toggleRecurring = (billId) => {
                  setRecurringBills(prev => prev.map(b => b.id === billId ? { ...b, active: !b.active } : b));
                };

                const totalUnpaid = bills.filter(b => b.status === "unpaid").reduce((sum, b) => sum + b.amount, 0);
                const totalPaid = bills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
                const monthlyRecurring = recurringBills.filter(b => b.active && b.frequency === "Monthly").reduce((sum, b) => sum + b.amount, 0);

                return (
                  <div className="view-container-fade" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    {/* Summary Cards */}
                    <div className="stats-grid">
                      <div className="stats-card">
                        <p className="card-label">Unpaid Bills</p>
                        <p className="card-value" style={{ color: "#dc2626" }}>{money(totalUnpaid)}</p>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{bills.filter(b => b.status === "unpaid").length} bills pending</span>
                      </div>
                      <div className="stats-card">
                        <p className="card-label">Paid This Month</p>
                        <p className="card-value" style={{ color: "#16a34a" }}>{money(totalPaid)}</p>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{bills.filter(b => b.status === "paid").length} bills settled</span>
                      </div>
                      <div className="stats-card">
                        <p className="card-label">Monthly Recurring</p>
                        <p className="card-value" style={{ color: "#0ea5e9" }}>{money(monthlyRecurring)}</p>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{recurringBills.filter(b => b.active).length} active subscriptions</span>
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
                      {['upcomingBills', 'recurring', 'history'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setBillsTabSelected(tab)}
                          style={{
                            padding: '8px 16px',
                            background: billsTabSelected === tab ? '#4f46e5' : '#f8fafc',
                            color: billsTabSelected === tab ? '#fff' : '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: billsTabSelected === tab ? '600' : '500',
                            fontSize: '14px'
                          }}
                        >
                          {tab === 'upcomingBills' && '📅 Upcoming Bills'}
                          {tab === 'recurring' && '🔄 Recurring'}
                          {tab === 'history' && '📜 History'}
                        </button>
                      ))}
                    </div>

                    {/* Upcoming Bills Tab */}
                    {billsTabSelected === 'upcomingBills' && (
                      <div className="panel-card view-container-fade">
                        <div className="panel-header border-bottom-header">
                          <div>
                            <h2 className="panel-title"><FileText className="inline-icon icon-sm text-indigo" /> Upcoming Bills & Payments</h2>
                            <p className="panel-subtitle">Track and manage your upcoming bills and due dates.</p>
                          </div>
                          <button className="setup-submit-btn" style={{ width: "auto", margin: 0, padding: "0 20px" }} onClick={() => setShowAddBillModal(true)}>
                            Create Bill Alert
                          </button>
                        </div>

                        <div className="bills-grid">
                          {bills.map(b => (
                            <div key={b.id} className="bill-card">
                              <div className="bill-header">
                                <div className="bill-logo-circle">{b.name.charAt(0)}</div>
                                <span className={`bill-due-tag ${b.status}`}>{b.status.toUpperCase()}</span>
                              </div>
                              <div style={{ marginTop: "14px" }}>
                                <h3 style={{ fontSize: "18px", color: "var(--ink)", fontWeight: "600" }}>{b.name}</h3>
                                <span style={{ fontSize: "12px", color: "var(--muted)" }}>{b.category} • Due: {new Date(b.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                                <div>
                                  <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>Payment Method</span>
                                  <strong style={{ fontSize: "13px", color: "var(--ink)" }}>{b.paymentMethod}</strong>
                                </div>
                                <strong style={{ fontSize: "18px", color: "var(--ink)" }}>{money(b.amount)}</strong>
                              </div>
                              {b.status === "unpaid" ? (
                                <button 
                                  type="button" 
                                  onClick={() => handlePayBill(b.id)}
                                  className="setup-submit-btn" 
                                  style={{ marginTop: "16px", height: "40px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "none" }}
                                >
                                  Authorize Payment
                                </button>
                              ) : (
                                <div style={{ textAlign: "center", padding: "10px", background: "#f0fdf4", color: "#16a34a", borderRadius: "8px", fontWeight: "600", fontSize: "13px", marginTop: "16px" }}>Paid successfully</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recurring Subscriptions Tab */}
                    {billsTabSelected === 'recurring' && (
                      <div className="panel-card view-container-fade">
                        <div className="panel-header border-bottom-header">
                          <div>
                            <h2 className="panel-title"><Bell className="inline-icon icon-sm text-purple" /> Active Subscriptions</h2>
                            <p className="panel-subtitle">Manage recurring subscriptions and memberships.</p>
                          </div>
                        </div>

                        <div style={{ marginTop: "16px" }}>
                          <table className="enterprise-data-table">
                            <thead>
                              <tr>
                                <th>Subscription Name</th>
                                <th>Frequency</th>
                                <th>Amount</th>
                                <th>Next Renewal</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recurringBills.map(sub => (
                                <tr key={sub.id}>
                                  <td><strong>{sub.name}</strong></td>
                                  <td>{sub.frequency}</td>
                                  <td><strong>{money(sub.amount)}</strong></td>
                                  <td>{new Date(sub.nextDate).toLocaleDateString()}</td>
                                  <td>
                                    <span style={{
                                      background: sub.active ? "#d1fae5" : "#fee2e2",
                                      color: sub.active ? "#065f46" : "#7f1d1d",
                                      padding: "4px 12px",
                                      borderRadius: "20px",
                                      fontSize: "12px",
                                      fontWeight: "600"
                                    }}>
                                      {sub.active ? "Active" : "Inactive"}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      onClick={() => toggleRecurring(sub.id)}
                                      style={{
                                        background: sub.active ? "#fee2e2" : "#d1fae5",
                                        color: sub.active ? "#dc2626" : "#059669",
                                        border: "none",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                      }}
                                    >
                                      {sub.active ? "Cancel" : "Reactivate"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Payment History Tab */}
                    {billsTabSelected === 'history' && (
                      <div className="panel-card view-container-fade">
                        <div className="panel-header border-bottom-header">
                          <div>
                            <h2 className="panel-title"><List className="inline-icon icon-sm text-blue" /> Payment History</h2>
                            <p className="panel-subtitle">View your complete bill payment transaction history.</p>
                          </div>
                        </div>

                        <div style={{ marginTop: "16px" }}>
                          <table className="enterprise-data-table">
                            <thead>
                              <tr>
                                <th>Bill Name</th>
                                <th>Payment Method</th>
                                <th>Amount Paid</th>
                                <th>Payment Date</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paymentHistory.map(payment => (
                                <tr key={payment.id}>
                                  <td><strong>{payment.billName}</strong></td>
                                  <td><span className="category-capsule-tag">{payment.method}</span></td>
                                  <td><strong>{money(payment.amount)}</strong></td>
                                  <td>{new Date(payment.paidDate).toLocaleDateString()}</td>
                                  <td>
                                    <span style={{
                                      background: "#d1fae5",
                                      color: "#065f46",
                                      padding: "4px 12px",
                                      borderRadius: "20px",
                                      fontSize: "12px",
                                      fontWeight: "600"
                                    }}>
                                      {payment.status.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {showAddBillModal && (
                      <div className="modal-overlay">
                        <div className="panel-card" style={{ width: "100%", maxWidth: "440px" }}>
                          <h2 className="panel-title" style={{ marginBottom: "16px" }}>Create Subscription Bill Alert</h2>
                          <form onSubmit={handleAddBill}>
                            <div className="dashboard-input-group">
                              <label className="dashboard-input-label">Subscription Name</label>
                              <input className="dashboard-panel-input" type="text" placeholder="e.g. Netflix, Spotify" value={billName} onChange={(e) => setBillName(e.target.value)} required />
                            </div>
                            <div className="dashboard-input-group">
                              <label className="dashboard-input-label">Amount (Rs.)</label>
                              <input className="dashboard-panel-input" type="number" placeholder="0.00" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} required />
                            </div>
                            <div className="dashboard-input-group">
                              <label className="dashboard-input-label">Category</label>
                              <select className="dashboard-panel-select" value={billCategory} onChange={(e) => setBillCategory(e.target.value)}>
                                <option value="Housing">Housing</option>
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Savings">Savings</option>
                              </select>
                            </div>
                            <div className="dashboard-input-group">
                              <label className="dashboard-input-label">Due Date</label>
                              <input className="dashboard-panel-input" type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} required />
                            </div>
                            <div className="dashboard-input-group">
                              <label className="dashboard-input-label">Default Payment Method</label>
                              <select className="dashboard-panel-select" value={billAccount} onChange={(e) => setBillAccount(e.target.value)}>
                                <option value="Cash Wallet">Cash Wallet</option>
                                <option value="Bank Account">Bank Account</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="UPI Account">UPI Account</option>
                              </select>
                            </div>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "20px" }}>
                              <button type="button" className="profile-action-toggle-btn" onClick={() => setShowAddBillModal(false)}>Cancel</button>
                              <button type="submit" className="setup-submit-btn" style={{ width: "auto", margin: 0, padding: "0 24px" }}>Add Bill Alert</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {/* ========================================================================= */}
          {/* ADMIN DASHBOARD (ROLE 2) */}
          {/* ========================================================================= */}
          {Number(userRole) === 2 && (
            <>
              {/* SYSTEM OVERVIEW */}
              {activeTab === 0 && (
                <>
                  <div className="stats-grid">
                    <StatCard icon={Users} label="Total Accounts Registry" value={`${allUsersList.length} Accounts`} note="All verified users" tone="blue" />
                    <StatCard icon={Activity} label="Gateway Sync Latency" value="1.8 ms" note="Downstream nodes active" tone="teal" />
                    <StatCard icon={Server} label="Compute Cluster Resources" value="32.4% CPU" note="Operational load" tone="orange" />
                    <StatCard icon={Database} label="PostgreSQL DB Health" value="Active" note="Ready for transaction logs" tone="green" />
                  </div>

                  <div className="panel-card" style={{ marginTop: "24px" }}>
                    <h2 className="panel-title">System Status Overview</h2>
                    <p className="panel-subtitle">Monitoring all microservices and databases configurations.</p>
                    <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div style={{ padding: "16px", background: "var(--surface-soft)", borderRadius: "12px" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>PostgreSQL Connection</span>
                        <h4 style={{ fontSize: "16px", marginTop: "8px" }}>Status: <span style={{ color: "#10b981" }}>ONLINE</span></h4>
                        <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>Port: 5432 | Database: project1</p>
                      </div>
                      <div style={{ padding: "16px", background: "var(--surface-soft)", borderRadius: "12px" }}>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>Node.js / MongoDB service</span>
                        <h4 style={{ fontSize: "16px", marginTop: "8px" }}>Status: <span style={{ color: "#10b981" }}>ONLINE / FALLBACK</span></h4>
                        <p style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>Port: 5000 | Collections: transactions</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* USER MANAGEMENT */}
              {activeTab === 1 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header">
                    <div>
                      <h2 className="panel-title"><Users className="inline-icon icon-sm text-blue" /> Administrative User Registry</h2>
                      <p className="panel-subtitle">Suspend, inspect, or configure permissions on all system accounts.</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button className="setup-submit-btn" style={{ width: "auto", margin: 0, padding: "0 16px", height: "40px" }} onClick={() => setShowAdminUserModal(true)}>
                        <Plus size={16} /> Add User
                      </button>
                      <button className="profile-action-toggle-btn" onClick={() => fetchAllUsers()}>Refresh accounts</button>
                    </div>
                  </div>

                  {/* Search and Filters Layout */}
                  <div className="search-filter-layout-row">
                    <div className="search-input-wrapper">
                      <input 
                        type="text" 
                        placeholder="Search users name or email..." 
                        className="dashboard-panel-input" 
                        value={userSearchQuery} 
                        onChange={(e) => setUserSearchQuery(e.target.value)} 
                      />
                    </div>
                    <div className="filter-select-wrapper">
                      <select className="dashboard-panel-select" value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="1">User</option>
                        <option value="2">Admin</option>
                        <option value="3">Manager</option>
                      </select>
                    </div>
                    <div className="filter-select-wrapper">
                      <select className="dashboard-panel-select" value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="1">Active</option>
                        <option value="0">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div className="table-scroll-frame">
                    <table className="enterprise-data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsersList
                          .filter(u => {
                            if (!u) return false;
                            const query = userSearchQuery.toLowerCase();
                            const matchesSearch = 
                              (u.fullname || "").toLowerCase().includes(query) ||
                              (u.email || "").toLowerCase().includes(query) ||
                              (u.phone || "").toLowerCase().includes(query);
                            const matchesRole = userRoleFilter === "all" || String(u.role) === userRoleFilter;
                            const matchesStatus = userStatusFilter === "all" || String(u.status) === userStatusFilter;
                            return matchesSearch && matchesRole && matchesStatus;
                          })
                          .map((u) => (
                            <tr key={u.id}>
                              <td><code>USR-{u.id}</code></td>
                              <td><strong>{u.fullname}</strong></td>
                              <td>{u.email}</td>
                              <td>{u.phone || "N/A"}</td>
                              <td>
                                <span className="flow-status-pill" style={{ 
                                  background: u.role === 2 ? '#fee2e2' : u.role === 3 ? '#e0e7ff' : '#eff6ff', 
                                  color: u.role === 2 ? '#b91c1c' : u.role === 3 ? '#4338ca' : '#1d4ed8' 
                                }}>
                                  {u.role === 2 ? 'Admin' : u.role === 3 ? 'Manager' : 'User'}
                                </span>
                              </td>
                              <td>
                                <span className="flow-status-pill" style={{ background: u.status === 1 ? '#dcfce7' : '#f1f5f9', color: u.status === 1 ? '#15803d' : '#475569' }}>
                                  {u.status === 1 ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                  <button 
                                    style={{ padding: "4px 8px", background: u.status === 1 ? "#fee2e2" : "#dcfce7", color: u.status === 1 ? "#991b1b" : "#166534", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}
                                    onClick={() => {
                                      setAllUsersList(prev => prev.map(item => item.id === u.id ? { ...item, status: item.status === 1 ? 0 : 1 } : item));
                                      showToast(`User status updated for ${u.fullname}`);
                                    }}
                                  >
                                    {u.status === 1 ? 'Suspend' : 'Activate'}
                                  </button>
                                  <button 
                                    style={{ padding: "4px 8px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}
                                    onClick={() => handleAdminDeleteUser(u.id, u.fullname)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CATEGORY MANAGEMENT */}
              {activeTab === 2 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header">
                    <div>
                      <h2 className="panel-title">
                        <Folder className="inline-icon icon-sm text-indigo" /> Platform Category Management
                      </h2>
                      <p className="panel-subtitle">Create, monitor, and clean system-wide categories for classification of transaction records.</p>
                    </div>
                  </div>
                  
                  <div className="category-crud-workspace" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginTop: "24px" }}>
                    {/* Category Creator Form */}
                    <div style={{ background: "var(--surface-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                      <h3>Create Platform Category</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCatName.trim()) return;
                        if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
                          showToast("Category name already exists!", "error");
                          return;
                        }
                        const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
                        const newCat = { id: nextId, name: newCatName.trim(), type: newCatType };
                        setCategories(prev => [...prev, newCat]);
                        setNewCatName("");
                        showToast(`Platform Category "${newCatName}" added.`);
                        appendActivity(`Admin created platform category: "${newCatName}" (${newCatType})`);
                      }} style={{ marginTop: "16px" }}>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Category Name</label>
                          <input 
                            className="dashboard-panel-input" 
                            type="text" 
                            placeholder="e.g. Health, Education" 
                            value={newCatName} 
                            onChange={(e) => setNewCatName(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="dashboard-input-group">
                          <label className="dashboard-input-label">Flow Type Classification</label>
                          <select 
                            className="dashboard-panel-select" 
                            value={newCatType} 
                            onChange={(e) => setNewCatType(e.target.value)}
                          >
                            <option value="expense">Debit / Expense Category</option>
                            <option value="income">Credit / Income Category</option>
                          </select>
                        </div>
                        <button type="submit" className="setup-submit-btn" style={{ width: "100%", marginTop: "16px" }}>
                          Create Platform Category
                        </button>
                      </form>
                    </div>

                    {/* Categories List */}
                    <div>
                      <h3>System categories list</h3>
                      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {categories.map((cat) => (
                          <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--card-bg)", border: "1px solid var(--line)", borderRadius: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "10px", height: "10px", background: categoryColors[cat.name], borderRadius: "50%" }}></span>
                              <strong style={{ color: "var(--ink)" }}>{cat.name}</strong>
                              <span className={`flow-status-pill ${cat.type === 'income' ? 'status-credit' : 'status-debit'}`} style={{ fontSize: "10px", padding: "2px 6px" }}>
                                {cat.type}
                              </span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete platform category "${cat.name}"?`)) {
                                  setCategories(prev => prev.filter(c => c.id !== cat.id));
                                  showToast(`Category "${cat.name}" deleted.`);
                                  appendActivity(`Admin deleted category "${cat.name}"`);
                                }
                              }} 
                              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SYSTEM REPORTS */}
              {activeTab === 3 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header">
                    <div>
                      <h2 className="panel-title">
                        <BarChart2 className="inline-icon icon-sm text-purple" /> Platform System Reports & Statistics
                      </h2>
                      <p className="panel-subtitle">Aggregated database insights, register statistics, and financial tracking metrics.</p>
                    </div>
                  </div>
                  
                  <div className="stats-grid" style={{ marginTop: "24px" }}>
                    <StatCard 
                      icon={Users} 
                      label="Total Active Users" 
                      value={`${allUsersList.filter(u => u && u.status === 1).length} Users`} 
                      note="Active user sessions" 
                      tone="blue" 
                    />
                    <StatCard 
                      icon={Users} 
                      label="Total Suspended Users" 
                      value={`${allUsersList.filter(u => u && u.status === 0).length} Accounts`} 
                      note="Administratively locked" 
                      tone="red" 
                    />
                    <StatCard 
                      icon={Shield} 
                      label="Total Platform Admins" 
                      value={`${allUsersList.filter(u => u && u.role === 2).length} Admins`} 
                      note="System controllers" 
                      tone="green" 
                    />
                    <StatCard 
                      icon={Activity} 
                      label="Total System Managers" 
                      value={`${allUsersList.filter(u => u && u.role === 3).length} Managers`} 
                      note="Budget approval nodes" 
                      tone="orange" 
                    />
                  </div>

                  <div className="panel-card" style={{ marginTop: "24px", background: "var(--surface-soft)" }}>
                    <h3>System User Accounts Breakdown</h3>
                    <div className="table-scroll-frame" style={{ marginTop: "16px" }}>
                      <table className="enterprise-data-table">
                        <thead>
                          <tr>
                            <th>Role Type</th>
                            <th>Count</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Regular Users</strong></td>
                            <td>{allUsersList.filter(u => u && u.role === 1).length}</td>
                            <td>{allUsersList.length > 0 ? Math.round((allUsersList.filter(u => u && u.role === 1).length / allUsersList.length) * 100) : 0}%</td>
                          </tr>
                          <tr>
                            <td><strong>Administrators</strong></td>
                            <td>{allUsersList.filter(u => u && u.role === 2).length}</td>
                            <td>{allUsersList.length > 0 ? Math.round((allUsersList.filter(u => u && u.role === 2).length / allUsersList.length) * 100) : 0}%</td>
                          </tr>
                          <tr>
                            <td><strong>Department Managers</strong></td>
                            <td>{allUsersList.filter(u => u && u.role === 3).length}</td>
                            <td>{allUsersList.length > 0 ? Math.round((allUsersList.filter(u => u && u.role === 3).length / allUsersList.length) * 100) : 0}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* AUDIT LOGS */}
              {activeTab === 4 && (
                <div className="panel-card view-container-fade">
                  <div className="panel-header border-bottom-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 className="panel-title">
                        <List className="inline-icon icon-sm text-indigo" /> Administrative & System Audit Logs
                      </h2>
                      <p className="panel-subtitle">Chronological ledger recording all security events, user creation operations, and system modifications.</p>
                    </div>
                    <button 
                      className="profile-action-toggle-btn" 
                      onClick={() => {
                        setActivityLogs(prev => [
                          { id: Date.now(), action: "Admin cleared system log buffer", timestamp: new Date() },
                          ...prev
                        ]);
                        showToast("Audit logs updated.");
                      }}
                    >
                      Refresh Audits
                    </button>
                  </div>

                  <div className="activity-timeline" style={{ marginTop: "24px" }}>
                    {activityLogs.map((log) => (
                      <div key={log.id} className="activity-item">
                        <div className="activity-dot" style={{ background: log.action.includes("Admin") ? "#4f46e5" : "#10b981" }}></div>
                        <div className="activity-content">
                          <p className="activity-text" style={{ fontWeight: log.action.includes("Admin") ? "700" : "400" }}>{log.action}</p>
                          <span className="activity-time">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {activityLogs.length === 0 && (
                      <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>No audit log history records found.</div>
                    )}
                  </div>
                </div>
              )}

              {/* DATABASE CONTROL */}
              {activeTab === 5 && (
                <div className="panel-card view-container-fade">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "12px", marginBottom: "20px" }}>
                    <div>
                      <h2 className="panel-title"><Database className="inline-icon icon-sm text-green" /> Database Control Panel</h2>
                      <p className="panel-subtitle">Monitor and administer relational PostgreSQL schemas and MongoDB document collections.</p>
                    </div>
                  </div>

                  {/* Sub-tab selection bar */}
                  <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <button 
                      type="button" 
                      onClick={() => setDbSubTab("postgres")} 
                      style={{
                        padding: "8px 16px",
                        background: dbSubTab === "postgres" ? "var(--blue)" : "none",
                        color: dbSubTab === "postgres" ? "#fff" : "var(--ink)",
                        border: "1px solid var(--line)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s"
                      }}
                    >
                      PostgreSQL Database
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setDbSubTab("mongodb");
                        fetchMongoCollectionData(mongoSelectedCollection);
                      }} 
                      style={{
                        padding: "8px 16px",
                        background: dbSubTab === "mongodb" ? "var(--blue)" : "none",
                        color: dbSubTab === "mongodb" ? "#fff" : "var(--ink)",
                        border: "1px solid var(--line)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s"
                      }}
                    >
                      MongoDB Collections
                    </button>
                  </div>

                  {dbSubTab === "postgres" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginTop: "24px" }}>
                      <div style={{ background: "var(--surface-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                        <h3>Connection variables</h3>
                        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", justify: "space-between" }}>
                            <span>PostgreSQL Host</span>
                            <strong>localhost:5432</strong>
                          </div>
                          <div style={{ display: "flex", justify: "space-between" }}>
                            <span>Query Latency avg</span>
                            <strong>2.4 ms</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: "var(--surface-soft)", padding: "20px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                        <h3>Administrative Jobs</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                          <button className="auth-submit" style={{ background: "#10b981", margin: 0, height: "40px" }} onClick={triggerPostgresBackup}>
                            🚀 Run Immediate full backup
                          </button>
                          <button className="auth-submit" style={{ background: "#3b82f6", margin: 0, height: "40px" }} onClick={triggerIndexOptimize}>
                            ⚙️ Optimize DB Indexes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {dbSubTab === "mongodb" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {/* Collection Selector Tabs */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                        {["expense_logs", "expense_embeddings", "user_activity"].map(col => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => {
                              setMongoSelectedCollection(col);
                              fetchMongoCollectionData(col);
                            }}
                            style={{
                              padding: "8px 16px",
                              background: mongoSelectedCollection === col ? "var(--green)" : "var(--surface-soft)",
                              color: mongoSelectedCollection === col ? "#fff" : "var(--ink)",
                              border: "1px solid var(--line)",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            📁 {col}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => fetchMongoCollectionData()}
                          className="profile-action-toggle-btn"
                          style={{ marginLeft: "auto", padding: "8px 16px", fontSize: "13px", height: "auto" }}
                        >
                          🔄 Refresh {mongoSelectedCollection}
                        </button>
                      </div>

                      {/* Collection Metadata Info Alert */}
                      <div style={{ background: "var(--surface-soft)", padding: "12px 16px", borderRadius: "8px", borderLeft: "4px solid var(--green)", fontSize: "13px" }}>
                        Currently browsing <strong>money_manager</strong> database, collection <code>{mongoSelectedCollection}</code>. Showing latest {mongoCollectionData.length} records.
                      </div>

                      {/* Search / Filter input */}
                      <div className="search-input-wrapper" style={{ position: "relative" }}>
                        <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                        <input 
                          type="text" 
                          placeholder={`Filter ${mongoSelectedCollection} records...`} 
                          className="dashboard-panel-input" 
                          style={{ paddingLeft: "42px", margin: 0 }}
                          value={mongoSearch}
                          onChange={(e) => setMongoSearch(e.target.value)}
                        />
                      </div>

                      {/* Render Collection Data Table */}
                      <div className="table-scroll-frame">
                        {(() => {
                          const query = mongoSearch.toLowerCase();
                          const filtered = mongoCollectionData.filter(doc => {
                            if (!doc) return false;
                            const docId = String(doc._id || doc.id || "").toLowerCase();
                            const userId = String(doc.userId || "").toLowerCase();
                            const text = String(doc.text || "").toLowerCase();
                            const description = String(doc.description || doc.name || "").toLowerCase();
                            const action = String(doc.action || "").toLowerCase();
                            const category = String(doc.category || "").toLowerCase();
                            const entity = String(doc.entity || "").toLowerCase();
                            const model = String(doc.model || "").toLowerCase();
                            
                            return docId.includes(query) || 
                                   userId.includes(query) || 
                                   text.includes(query) || 
                                   description.includes(query) || 
                                   action.includes(query) || 
                                   category.includes(query) ||
                                   entity.includes(query) ||
                                   model.includes(query);
                          });

                          if (mongoLoading) {
                            return (
                              <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                                Loading documents from MongoDB...
                              </div>
                            );
                          }

                          if (filtered.length === 0) {
                            return (
                              <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                                No documents match active filters.
                              </div>
                            );
                          }

                          if (mongoSelectedCollection === "expense_logs") {
                            return (
                              <table className="enterprise-data-table">
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>User ID</th>
                                    <th>Description / Name</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filtered.map((doc, idx) => (
                                    <tr key={doc._id || idx}>
                                      <td><code>{(doc._id || doc.id || "").slice(-8)}</code></td>
                                      <td><code>USR-{doc.userId}</code></td>
                                      <td><strong>{doc.description || doc.name || "N/A"}</strong></td>
                                      <td>
                                        <span className={`flow-status-pill ${doc.type === 'income' ? 'status-credit' : 'status-debit'}`}>
                                          {doc.type}
                                        </span>
                                      </td>
                                      <td><strong>{money(doc.amount)}</strong></td>
                                      <td><span className="category-capsule-tag">{doc.category}</span></td>
                                      <td>{doc.date ? new Date(doc.date).toLocaleDateString() : "N/A"}</td>
                                      <td style={{ textAlign: "right" }}>
                                        <button 
                                          type="button" 
                                          className="profile-action-toggle-btn" 
                                          onClick={() => setSelectedMongoDoc(doc)}
                                          style={{ padding: "4px 8px", fontSize: "11px" }}
                                        >
                                          View JSON
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            );
                          }

                          if (mongoSelectedCollection === "expense_embeddings") {
                            return (
                              <table className="enterprise-data-table">
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>User ID</th>
                                    <th>Expense ID</th>
                                    <th>Embedded Text</th>
                                    <th>Embedding Model</th>
                                    <th>Vector Dimensions</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filtered.map((doc, idx) => (
                                    <tr key={doc._id || idx}>
                                      <td><code>{(doc._id || doc.id || "").slice(-8)}</code></td>
                                      <td><code>USR-{doc.userId}</code></td>
                                      <td><code>{doc.expenseLogId ? doc.expenseLogId.slice(-8) : "N/A"}</code></td>
                                      <td style={{ maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {doc.text || "N/A"}
                                      </td>
                                      <td><code style={{ background: "var(--surface-soft)", padding: "2px 6px", borderRadius: "4px" }}>{doc.model || "N/A"}</code></td>
                                      <td><strong>{Array.isArray(doc.embedding) ? doc.embedding.length : 0} dims</strong></td>
                                      <td style={{ textAlign: "right" }}>
                                        <button 
                                          type="button" 
                                          className="profile-action-toggle-btn" 
                                          onClick={() => setSelectedMongoDoc(doc)}
                                          style={{ padding: "4px 8px", fontSize: "11px" }}
                                        >
                                          View JSON
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            );
                          }

                          if (mongoSelectedCollection === "user_activity") {
                            return (
                              <table className="enterprise-data-table">
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th>User ID</th>
                                    <th>Action Type</th>
                                    <th>Target Entity</th>
                                    <th>IP Address</th>
                                    <th>Timestamp</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filtered.map((doc, idx) => (
                                    <tr key={doc._id || idx}>
                                      <td><code>{(doc._id || doc.id || "").slice(-8)}</code></td>
                                      <td><code>USR-{doc.userId}</code></td>
                                      <td>
                                        <span className="flow-status-pill" style={{ background: "#e0e7ff", color: "#4338ca" }}>
                                          {doc.action}
                                        </span>
                                      </td>
                                      <td><code>{doc.entity || "expense_log"}</code></td>
                                      <td><code>{doc.ip || "127.0.0.1"}</code></td>
                                      <td>{doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "N/A"}</td>
                                      <td style={{ textAlign: "right" }}>
                                        <button 
                                          type="button" 
                                          className="profile-action-toggle-btn" 
                                          onClick={() => setSelectedMongoDoc(doc)}
                                          style={{ padding: "4px 8px", fontSize: "11px" }}
                                        >
                                          View JSON
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            );
                          }

                          return null;
                        })()}
                      </div>
                    </div>
                  )}

                  {/* JSON Detail Inspector Modal */}
                  {selectedMongoDoc && (
                    <div style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(15, 23, 42, 0.6)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1000
                    }}>
                      <div className="panel-card" style={{ width: "100%", maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>
                          <h2 className="panel-title" style={{ margin: 0 }}>Document Inspector ({mongoSelectedCollection})</h2>
                          <button 
                            type="button" 
                            onClick={() => setSelectedMongoDoc(null)} 
                            style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--ink)" }}
                          >
                            ✕
                          </button>
                        </div>
                        <pre style={{
                          background: "#0f172a",
                          color: "#38bdf8",
                          padding: "16px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          overflow: "auto",
                          fontFamily: "monospace",
                          lineHeight: "1.5",
                          flexGrow: 1,
                          textAlign: "left"
                        }}>
                          {JSON.stringify(selectedMongoDoc, null, 2)}
                        </pre>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                          <button type="button" className="profile-action-toggle-btn" onClick={() => setSelectedMongoDoc(null)}>Close Inspector</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INFRASTRUCTURE MONITOR */}
              {activeTab === 6 && (
                <div className="panel-card view-container-fade">
                  <h2 className="panel-title"><Server className="inline-icon icon-sm text-orange" /> Infrastructure Node Monitor</h2>
                  <p className="panel-subtitle">Inspect compute resources, cluster memory pressure, and API gateway health.</p>
                  <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                    <div className="metric-row-card">
                      <div className="metric-header">
                        <strong>Cluster CPU Load</strong>
                        <span>32% Active</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: "32%", background: "#10b981" }} />
                      </div>
                    </div>
                    <div className="metric-row-card">
                      <div className="metric-header">
                        <strong>Heap memory allocations</strong>
                        <span>68% Used</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: "68%", background: "#f59e0b" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* MANAGER DASHBOARD (ROLE 3) */}
          {/* ========================================================================= */}
          {Number(userRole) === 3 && (
            <>
              {/* MANAGER PULSE */}
              {activeTab === 0 && (
                <>
                  <div className="stats-grid">
                    <StatCard icon={DollarSign} label="Total Department Budgets" value="Rs. 4,85,000.00" note="Supervised users limit pools" tone="teal" />
                    <StatCard icon={AlertCircle} label="Override Request Flags" value="3 Pending" note="Requires attention" tone="orange" />
                    <StatCard icon={Users} label="Supervised Team Developers" value="8 Active Nodes" note="All syncing live" tone="blue" />
                  </div>
                </>
              )}

              {/* TEAM OVERVIEW */}
              {activeTab === 1 && (
                <div className="panel-card view-container-fade">
                  <h2 className="panel-title"><Users className="inline-icon icon-sm text-teal" /> Supervised Team Members</h2>
                  <p className="panel-subtitle">Assigned developers and operations staff nodes.</p>

                  <div className="table-scroll-frame" style={{ marginTop: "20px" }}>
                    <table className="enterprise-data-table">
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Email</th>
                          <th>Node Sector</th>
                          <th>Cap Limit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: "Amit Sharma", email: "amit.sharma@mth.com", node: "Logistics Operations", cap: "Rs. 1,50,000" },
                          { name: "Priya Patel", email: "priya.patel@mth.com", node: "Client onboarding", cap: "Rs. 95,000" }
                        ].map((m, i) => (
                          <tr key={i}>
                            <td><strong>{m.name}</strong></td>
                            <td>{m.email}</td>
                            <td><span className="category-capsule-tag">{m.node}</span></td>
                            <td><strong>{m.cap}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* BUDGET APPROVALS OVERRIDES */}
              {activeTab === 2 && (
                <div className="panel-card view-container-fade">
                  <h2 className="panel-title"><DollarSign className="inline-icon icon-sm text-green" /> Override Requests approvals</h2>
                  <p className="panel-subtitle">Review and authorize pending category budget adjustments.</p>

                  <div className="table-scroll-frame" style={{ marginTop: "20px" }}>
                    <table className="enterprise-data-table">
                      <thead>
                        <tr>
                          <th>Team Member</th>
                          <th>Category</th>
                          <th>Requested Amount</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {managerBudgetRequests.map(r => (
                          <tr key={r.id}>
                            <td><strong>{r.name}</strong></td>
                            <td><span className="category-capsule-tag">{r.category}</span></td>
                            <td><strong style={{ color: "#3b82f6" }}>+ Rs. {r.amount}</strong></td>
                            <td>{r.reason}</td>
                            <td>
                              <span className="flow-status-pill" style={{ 
                                background: r.status === "Approved" ? "#dcfce7" : r.status === "Rejected" ? "#fee2e2" : "#fef3c7",
                                color: r.status === "Approved" ? "#15803d" : r.status === "Rejected" ? "#b91c1c" : "#b45309"
                              }}>
                                {r.status}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              {r.status === "Pending" ? (
                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                  <button 
                                    className="profile-action-toggle-btn" 
                                    style={{ background: "#10b981", color: "#fff", border: "none" }}
                                    onClick={() => {
                                      setManagerBudgetRequests(prev => prev.map(item => item.id === r.id ? { ...item, status: "Approved" } : item));
                                      showToast(`Approved override limit for ${r.name}`);
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    className="logout-btn" 
                                    style={{ padding: "6px 12px" }}
                                    onClick={() => {
                                      setManagerBudgetRequests(prev => prev.map(item => item.id === r.id ? { ...item, status: "Rejected" } : item));
                                      showToast(`Rejected override limit for ${r.name}`);
                                    }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: "var(--muted)", fontSize: "12px" }}>Resolved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PENDING ALERTS */}
              {activeTab === 3 && (
                <div className="panel-card view-container-fade">
                  <h2 className="panel-title"><AlertCircle className="inline-icon icon-sm text-yellow" /> System Alerts</h2>
                  <p className="panel-subtitle">Warnings raised by budget overruns or config events.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* --- ADD / EDIT TRANSACTION DIALOG MODAL POPUP --- */}
      {showTxnModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div className="panel-card" style={{ width: "100%", maxWidth: "480px", position: "relative" }}>
            <h2 className="panel-title" style={{ marginBottom: "16px" }}>
              {editingTxnId ? "Edit Ledger Record" : "Append New Ledger Record"}
            </h2>
            <form onSubmit={handleAddOrEditTransaction}>
              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Description Label</label>
                <input className="dashboard-panel-input" type="text" value={logExpenseName} onChange={(e) => setLogExpenseName(e.target.value)} required />
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Type</label>
                <select className="dashboard-panel-select" value={logTransactionType} onChange={(e) => setLogTransactionType(e.target.value)}>
                  <option value="expense">Expense (Outflow)</option>
                  <option value="income">Income (Inflow)</option>
                </select>
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Amount (Rs.)</label>
                <input className="dashboard-panel-input" type="number" value={logExpenseAmount} onChange={(e) => setLogExpenseAmount(e.target.value)} required />
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Category</label>
                <select className="dashboard-panel-select" value={logExpenseCategory} onChange={(e) => setLogExpenseCategory(e.target.value)}>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "16px" }}>
                <label className="dashboard-input-label">Date</label>
                <input className="dashboard-panel-input" type="date" value={logExpenseDate} onChange={(e) => setLogExpenseDate(e.target.value)} required />
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Payment Method / Account</label>
                <select className="dashboard-panel-select" value={logPaymentMethod} onChange={(e) => setLogPaymentMethod(e.target.value)}>
                  <option value="Cash Wallet">Cash Wallet</option>
                  <option value="Bank Account">Bank Account</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI Account">UPI Account</option>
                </select>
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Notes</label>
                <input className="dashboard-panel-input" type="text" placeholder="Additional details..." value={logNotes} onChange={(e) => setLogNotes(e.target.value)} />
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Upload Receipt Mock (Optional)</label>
                <input type="file" className="dashboard-panel-input" style={{ paddingTop: '10px' }} onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setLogReceiptImage(e.target.files[0].name);
                    showToast("Receipt cached successfully");
                  }
                }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <input type="checkbox" id="modal-recurring" checked={logRecurring} onChange={(e) => setLogRecurring(e.target.checked)} />
                <label htmlFor="modal-recurring" style={{ fontSize: "14px", color: "var(--ink)", cursor: "pointer" }}>Recurring Transaction</label>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="button" className="profile-action-toggle-btn" onClick={() => setShowTxnModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="setup-submit-btn" style={{ width: "auto", margin: 0, padding: "0 24px" }} disabled={loading}>
                  {loading ? "Processing..." : editingTxnId ? "Save Changes" : "Log Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdminUserModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div className="panel-card" style={{ width: "100%", maxWidth: "480px", position: "relative" }}>
            <h2 className="panel-title" style={{ marginBottom: "16px" }}>Create System User Account</h2>
            <form onSubmit={handleAdminCreateUser}>
              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Full Name</label>
                <input className="dashboard-panel-input" type="text" value={adminFullname} onChange={(e) => setAdminFullname(e.target.value)} required />
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Email address</label>
                <input className="dashboard-panel-input" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Password</label>
                <input className="dashboard-panel-input" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Role</label>
                <select className="dashboard-panel-select" value={adminRoleVal} onChange={(e) => setAdminRoleVal(e.target.value)}>
                  <option value="1">User</option>
                  <option value="2">Admin</option>
                  <option value="3">Manager</option>
                </select>
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "12px" }}>
                <label className="dashboard-input-label">Phone Number</label>
                <input className="dashboard-panel-input" type="tel" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
              </div>

              <div className="dashboard-input-group" style={{ marginBottom: "16px" }}>
                <label className="dashboard-input-label">Date of Birth</label>
                <input className="dashboard-panel-input" type="date" value={adminDob} onChange={(e) => setAdminDob(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="button" className="profile-action-toggle-btn" onClick={() => setShowAdminUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="setup-submit-btn" style={{ width: "auto", margin: 0, padding: "0 24px" }} disabled={loading}>
                  {loading ? "Processing..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
