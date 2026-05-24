package com.rpg.redsunapi.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;

@Configuration
public class CorsConfig {
  private static final Logger logger = Logger.getLogger(CorsConfig.class.getName());

  @Bean
  public CorsFilter corsFilter(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
    CorsConfiguration configuration = new CorsConfiguration();
    Arrays.stream(allowedOrigins.split(",")).map(String::trim).forEach(configuration::addAllowedOriginPattern);
    configuration.setAllowCredentials(true);
    configuration.addAllowedHeader("*");
    configuration.addAllowedMethod("GET");
    configuration.addAllowedMethod("POST");
    configuration.addAllowedMethod("PUT");
    configuration.addAllowedMethod("PATCH");
    configuration.addAllowedMethod("DELETE");
    configuration.addAllowedMethod("OPTIONS");

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    logger.log(Level.INFO, "CorsFilter initialized successfully.");
    return new CorsFilter(source);
  }
}
