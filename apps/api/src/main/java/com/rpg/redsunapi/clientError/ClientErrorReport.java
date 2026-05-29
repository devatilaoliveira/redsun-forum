package com.rpg.redsunapi.clientError;

import com.rpg.redsunapi.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "client_error_reports")
public class ClientErrorReport {

  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(updatable = false)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @Column(name = "user_email", length = 254)
  private String userEmail;

  @Column(nullable = false, length = 2000)
  private String message;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(length = 10000)
  private String stack;

  @Column(length = 2000)
  private String cause;

  @Column(length = 1000)
  private String route;

  @Column(length = 20)
  private String method;

  @Column(name = "status_code")
  private Integer statusCode;

  @Column(name = "user_agent", length = 1000)
  private String userAgent;

  @Column(length = 50)
  private String environment;

  @Column(name = "client_timestamp", columnDefinition = "TIMESTAMP WITH TIME ZONE")
  private OffsetDateTime clientTimestamp;

  @Column(length = 4000)
  private String metadata;

  @Column(name = "reported_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
  private OffsetDateTime reportedAt;

  public ClientErrorReport() {
  }

  public ClientErrorReport(
    User user,
    String userEmail,
    String message,
    String name,
    String stack,
    String cause,
    String route,
    String method,
    Integer statusCode,
    String userAgent,
    String environment,
    OffsetDateTime clientTimestamp,
    String metadata
  ) {
    this.user = user;
    this.userEmail = userEmail;
    this.message = message;
    this.name = name;
    this.stack = stack;
    this.cause = cause;
    this.route = route;
    this.method = method;
    this.statusCode = statusCode;
    this.userAgent = userAgent;
    this.environment = environment;
    this.clientTimestamp = clientTimestamp;
    this.metadata = metadata;
  }

  @PrePersist
  public void prePersist() {
    if (reportedAt == null) {
      reportedAt = OffsetDateTime.now();
    }
  }

  public UUID getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public String getUserEmail() {
    return userEmail;
  }

  public String getMessage() {
    return message;
  }

  public String getName() {
    return name;
  }

  public String getStack() {
    return stack;
  }

  public String getCause() {
    return cause;
  }

  public String getRoute() {
    return route;
  }

  public String getMethod() {
    return method;
  }

  public Integer getStatusCode() {
    return statusCode;
  }

  public String getUserAgent() {
    return userAgent;
  }

  public String getEnvironment() {
    return environment;
  }

  public OffsetDateTime getClientTimestamp() {
    return clientTimestamp;
  }

  public String getMetadata() {
    return metadata;
  }

  public OffsetDateTime getReportedAt() {
    return reportedAt;
  }
}
