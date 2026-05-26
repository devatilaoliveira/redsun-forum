package com.rpg.redsunapi.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.server.ResponseStatusException;
import sendinblue.ApiClient;
import sendinblue.ApiException;
import sendinblue.Configuration;
import sendinblue.auth.ApiKeyAuth;
import sibApi.TransactionalEmailsApi;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;

import java.util.List;

@Service
public class BrevoEmailService implements EmailService {

  private final TransactionalEmailsApi apiInstance;
  private static final String SUPPORT_EMAIL = "dev.atila.oliveira@gmail.com";
  private final String senderEmail;
  private final String senderName;

  public BrevoEmailService(
      @Value("${app.brevo.api-key}") String apiKey,
      @Value("${app.brevo.sender-email}") String senderEmail,
      @Value("${app.brevo.sender-name}") String senderName) {
    this.senderEmail = senderEmail;
    this.senderName = senderName;

    ApiClient defaultClient = Configuration.getDefaultApiClient();
    ApiKeyAuth apiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
    apiKeyAuth.setApiKey(apiKey);

    this.apiInstance = new TransactionalEmailsApi();
  }

  @Override
  public void sendSupportEmail(String userEmail, String identification, String subject, String message) {
    SendSmtpEmail email = new SendSmtpEmail();

    SendSmtpEmailSender sender = new SendSmtpEmailSender();
    sender.setEmail(senderEmail);
    sender.setName(senderName);
    email.setSender(sender);

    SendSmtpEmailTo recipient = new SendSmtpEmailTo();
    recipient.setEmail(SUPPORT_EMAIL);
    email.setTo(List.of(recipient));

    email.setSubject("RedSun Support: " + subject);
    email.setHtmlContent(buildSupportEmailHtml(userEmail, identification, subject, message));

    try {
      apiInstance.sendTransacEmail(email);
    } catch (ApiException e) {
      throw new ResponseStatusException(
        HttpStatus.BAD_GATEWAY, "Brevo rejected support email (status=" + e.getCode() + ")", e
      );
    }
  }

  private String buildSupportEmailHtml(String userEmail, String identification, String subject, String message) {
    return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
            <h1 style="color: #d32f2f; margin-bottom: 20px;">RedSun support request</h1>
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Account email:</strong> %s</p>
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Identification:</strong> %s</p>
            <p style="font-size: 16px; margin-bottom: 20px;"><strong>Subject:</strong> %s</p>
            <div style="background-color: #fff; border-radius: 8px; border: 1px solid #ddd; padding: 16px;">
              <p style="margin: 0; white-space: pre-wrap;">%s</p>
            </div>
          </div>
        </body>
        </html>
        """
        .formatted(
          escapeHtml(userEmail),
          escapeHtml(identification),
          escapeHtml(subject),
          escapeHtml(message)
        );
  }

  private String escapeHtml(String value) {
    return HtmlUtils.htmlEscape(value == null ? "" : value);
  }
}
