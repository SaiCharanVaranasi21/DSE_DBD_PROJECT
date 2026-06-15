import "./Starting.css";

import dashboardImage from "../img3_3.png";
import budgetImage from "../img2_2.png";
import savingsImage from "../savings.png";
import  img4  from '../img4_4.png';
import logo from "../logo.png";


const highlights = [
  { value: "10K+", label: "Active users" },
  { value: "98%", label: "Satisfaction" },
  { value: "Rs. 50K+", label: "Monthly savings" },
];

const features = [
  {
    title: "Track daily transactions",
    copy: "Record income and expenses with clear categories, dates, and account-level visibility.",
  },
  {
    title: "Plan smarter budgets",
    copy: "Compare planned spend with real usage and spot risky categories before they overflow.",
  },
  {
    title: "Review teams and approvals",
    copy: "Give admins and managers dedicated spaces for users, requests, and finance operations.",
  },
];

const Starting = ({ onLogin, onSignup }) => {
  return (
    <main className="lovable-home">
      <nav className="home-nav" aria-label="Primary navigation">
        <button className="home-brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={logo} alt="Money GO Logo" className="brand-mark-img" />
        </button>
        <div className="home-nav-actions">
          <button className="nav-link" type="button" onClick={onLogin}>Login</button>
          <button className="nav-cta" type="button" onClick={onSignup}>Get Started</button>
        </div>
      </nav>

      <section className="home-hero">
        <div className="hero-copy">
          <span className="hero-kicker">Personal finance workspace</span>
          <h1>Manage money with a dashboard that feels effortless.</h1>
          <p>
            Track spending, budgets, savings, user activity, and approvals from a clean finance platform
            built for users, managers, and admins.
          </p>
          <div className="hero-actions">
            <button className="hero-primary" type="button" onClick={onSignup}>Start now</button>
            <button className="hero-secondary" type="button" onClick={onLogin}>Login</button>
          </div>
          <div className="hero-stats">
            {highlights.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-preview" aria-label="Finance dashboard preview">
          <div className="preview-topbar">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="preview-balance">
            <span>Total balance</span>
            <strong>Rs. 24,580</strong>
            <small>+12% this month</small>
          </div>
          <img src={dashboardImage} alt="Financial analytics dashboard" />
        </div>
      </section>

      <section className="feature-band">
        {features.map((feature, index) => (
          <article className="feature-card" key={feature.title}>
            <span>{`0${index + 1}`}</span>
            <h2>{feature.title}</h2>
            <p>{feature.copy}</p>
          </article>
        ))}
      </section>

      <section className="split-showcase">
        <div>
          <span className="hero-kicker">Budget clarity</span>
          <h2>See what changed, what matters, and what needs action.</h2>
          <p>
            Use simple visual summaries to keep spending on track and make better financial decisions.
          </p>
          <button className="hero-primary" type="button" onClick={onSignup}>Create account</button>
        </div>
        <div className="showcase-stack">
          <img src={budgetImage} alt="Budget planning view" />
          <img src={img4} alt="Savings progress view" />
        </div>
      </section>
    </main>
  );
};

export default Starting;
