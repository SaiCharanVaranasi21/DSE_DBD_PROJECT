package mth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mth.models.UserFinancialProfile;

public interface UserFinancialRepository
        extends JpaRepository<UserFinancialProfile, Long> {

    Optional<UserFinancialProfile> findByUserId(Long userId);
}