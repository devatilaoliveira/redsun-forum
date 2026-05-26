package com.rpg.redsunapi.email;

public interface EmailService {

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
