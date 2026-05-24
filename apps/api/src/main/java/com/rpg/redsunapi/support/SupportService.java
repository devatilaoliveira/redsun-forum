package com.rpg.redsunapi.support;

import com.rpg.redsunapi.email.EmailService;
import com.rpg.redsunapi.support.dto.SupportRequestDTO;
import org.springframework.stereotype.Service;

@Service
public class SupportService {

  private final EmailService emailService;

  public SupportService(EmailService emailService) {
    this.emailService = emailService;
  }

  public void sendSupportMessage(String userEmail, SupportRequestDTO request) {
    emailService.sendSupportEmail(
      normalizeSingleLine(userEmail),
      normalizeSingleLine(request.identification()),
      normalizeSingleLine(request.subject()),
      request.message().trim()
    );
  }

  private String normalizeSingleLine(String value) {
    return value == null ? "" : value.replaceAll("[\\r\\n]+", " ").trim();
  }
}
