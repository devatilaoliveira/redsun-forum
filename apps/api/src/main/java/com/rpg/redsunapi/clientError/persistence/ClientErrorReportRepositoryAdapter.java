package com.rpg.redsunapi.clientError.persistence;

import com.rpg.redsunapi.clientError.ClientErrorReport;
import com.rpg.redsunapi.clientError.ClientErrorReportRepository;
import org.springframework.stereotype.Repository;

@Repository
public class ClientErrorReportRepositoryAdapter implements ClientErrorReportRepository {

  private final JpaClientErrorReportRepository jpaClientErrorReportRepository;

  public ClientErrorReportRepositoryAdapter(JpaClientErrorReportRepository jpaClientErrorReportRepository) {
    this.jpaClientErrorReportRepository = jpaClientErrorReportRepository;
  }

  @Override
  public ClientErrorReport save(ClientErrorReport errorReport) {
    return jpaClientErrorReportRepository.save(errorReport);
  }
}
