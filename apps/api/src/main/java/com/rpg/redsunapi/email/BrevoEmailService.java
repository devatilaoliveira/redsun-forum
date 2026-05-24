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
  private final int verificationCodeExpiryMinutes;

  public BrevoEmailService(
      @Value("${app.brevo.api-key}") String apiKey,
      @Value("${app.brevo.sender-email}") String senderEmail,
      @Value("${app.brevo.sender-name}") String senderName,
      @Value("${app.verification.code.expiry-minutes:15}") int verificationCodeExpiryMinutes) {
    this.senderEmail = senderEmail;
    this.senderName = senderName;
    this.verificationCodeExpiryMinutes = verificationCodeExpiryMinutes;

    ApiClient defaultClient = Configuration.getDefaultApiClient();
    ApiKeyAuth apiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
    apiKeyAuth.setApiKey(apiKey);

    this.apiInstance = new TransactionalEmailsApi();
  }

  @Override
  public void sendVerificationEmail(String toEmail, String verificationCode) {
    SendSmtpEmail email = new SendSmtpEmail();

    // Set sender
    SendSmtpEmailSender sender = new SendSmtpEmailSender();
    sender.setEmail(senderEmail);
    sender.setName(senderName);
    email.setSender(sender);

    // Set recipient
    SendSmtpEmailTo recipient = new SendSmtpEmailTo();
    recipient.setEmail(toEmail);
    email.setTo(List.of(recipient));

    // Set subject and content
    email.setSubject("Verify your RedSun Forum account");

    String htmlContent = buildVerificationEmailHtml(verificationCode);
    email.setHtmlContent(htmlContent);

    try {
      apiInstance.sendTransacEmail(email);
    } catch (ApiException e) {
      throw new ResponseStatusException(
        HttpStatus.BAD_GATEWAY, "Brevo rejected verification email (status=" + e.getCode() + ")", e
      );
    }
  }

  @Override
  public void sendPasswordResetCodeEmail(String toEmail, String resetCode) {
    SendSmtpEmail email = new SendSmtpEmail();

    SendSmtpEmailSender sender = new SendSmtpEmailSender();
    sender.setEmail(senderEmail);
    sender.setName(senderName);
    email.setSender(sender);

    SendSmtpEmailTo recipient = new SendSmtpEmailTo();
    recipient.setEmail(toEmail);
    email.setTo(List.of(recipient));

    email.setSubject("Reset your RedSun Forum password");
    email.setHtmlContent(buildPasswordResetEmailHtml(resetCode));

    try {
      apiInstance.sendTransacEmail(email);
    } catch (ApiException e) {
      throw new ResponseStatusException(
        HttpStatus.BAD_GATEWAY, "Brevo rejected password reset email (status=" + e.getCode() + ")", e
      );
    }
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

  private String buildVerificationEmailHtml(String verificationCode) {
    return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
            <h1 style="color: #d32f2f; margin-bottom: 20px;">Welcome to RedSun Forum!</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for registering. Enter the verification code below in the registration page to complete your account setup.
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 16px; background-color: #fff; border-radius: 8px; border: 1px dashed #d32f2f;">
              <p style="margin: 0; font-size: 14px; color: #666;">Verification code</p>
              <p style="margin: 8px 0 0; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #d32f2f;">%s</p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 0;">
              This code expires in %d minutes.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you didn't create an account with RedSun Forum, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
        """
        .formatted(verificationCode, verificationCodeExpiryMinutes);
  }

  private String buildPasswordResetEmailHtml(String resetCode) {
    return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
            <h1 style="color: #d32f2f; margin-bottom: 20px;">Reset your password</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Use the code below in the password reset screen to set a new password.
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 16px; background-color: #fff; border-radius: 8px; border: 1px dashed #d32f2f;">
              <p style="margin: 0; font-size: 14px; color: #666;">Password reset code</p>
              <p style="margin: 8px 0 0; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #d32f2f;">%s</p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 0;">
              This code expires in %d minutes.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
        """
        .formatted(resetCode, verificationCodeExpiryMinutes);
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
