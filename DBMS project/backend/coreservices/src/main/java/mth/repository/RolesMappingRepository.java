package mth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mth.models.RolesMappingId;
import mth.models.Rolesmapping;

@Repository
public interface RolesMappingRepository extends JpaRepository<Rolesmapping, RolesMappingId> {
	
	@Query("select R from Rolesmapping R where R.role=:roleId")
	public List<Rolesmapping> findByRole(@Param("roleId") Long roleId);

}
