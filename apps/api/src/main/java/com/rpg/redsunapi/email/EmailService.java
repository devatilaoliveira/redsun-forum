package com.rpg.redsunapi.email;

public interface EmailService {

    /**
     * Sends a verification email to the specified email address
     *
     * @param toEmail           recipient email address
     * @param verificationCode  one-time verification code to include in the email
     */
    void sendVerificationEmail(String toEmail, String verificationCode);

    /**
     * Sends a password reset email to the specified email address.
     *
     * @param toEmail     recipient email address
     * @param resetCode   one-time reset code to include in the email
     */
    void sendPasswordResetCodeEmail(String toEmail, String resetCode);

    /**
     * Sends a support message to the RedSun support inbox.
     *
     * @param userEmail       authenticated account email that submitted the request
     * @param identification  user-provided name or contact identifier
     * @param subject         support request subject
     * @param message         support request details
     */
    void sendSupportEmail(String userEmail, String identification, String subject, String message);
}
