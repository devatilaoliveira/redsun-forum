package com.rpg.redsunapi.clientError;

import com.rpg.redsunapi.clientError.dto.ClientErrorReportRequestDTO;
import com.rpg.redsunapi.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientErrorReportService {

  private final ClientErrorReportRepository clientErrorReportRepository;

  public ClientErrorReportService(ClientErrorReportRepository clientErrorReportRepository) {
    this.clientErrorReportRepository = clientErrorReportRepository;
  }

  @Transactional
  public void reportError(User user, ClientErrorReportRequestDTO request) {
    ClientErrorReport report = new ClientErrorReport(
      user,
      user.getEmail(),
      trim(request.message()),
      trim(request.name()),
      trimToNull(request.stack()),
      trimToNull(request.cause()),
      trimToNull(request.route()),
      trimToNull(request.method()),
      request.statusCode(),
      trimToNull(request.userAgent()),
      trimToNull(request.environment()),
      request.timestamp(),
      trimToNull(request.metadata())
    );

    clientErrorReportRepository.save(report);
  }

  private static String trim(String value) {
    return value.trim();
  }

  private static String trimToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}
