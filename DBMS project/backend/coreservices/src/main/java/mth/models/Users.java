package mth.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String fullname;

    @Column(unique = true)
    String email;

    String password;

    int role;

    int status;

    private String phone;

    private String dateOfBirth;

    private String preferredCurrency;

    @Column(columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean firstLogin = true;

    // ===== ID =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // ===== FULLNAME =====

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    // ===== EMAIL =====

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // ===== PASSWORD =====

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // ===== ROLE =====

    public int getRole() {
        return role;
    }

    public void setRole(int role) {
        this.role = role;
    }

    // ===== STATUS =====

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    // ===== PHONE =====

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // ===== DATE OF BIRTH =====

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    // ===== PREFERRED CURRENCY =====

    public String getPreferredCurrency() {
        return preferredCurrency;
    }

    public void setPreferredCurrency(String preferredCurrency) {
        this.preferredCurrency = preferredCurrency;
    }

    // ===== FIRST LOGIN =====

    public Boolean getFirstLogin() {
        return firstLogin;
    }

    public void setFirstLogin(Boolean firstLogin) {
        this.firstLogin = firstLogin;
    }
}