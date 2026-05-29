package com.rpg.redsunapi.clientError.persistence;

import com.rpg.redsunapi.clientError.ClientErrorReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface JpaClientErrorReportRepository extends JpaRepository<ClientErrorReport, UUID> {
}
