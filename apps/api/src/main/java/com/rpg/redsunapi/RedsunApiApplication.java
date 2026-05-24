package com.rpg.redsunapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RedsunApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(RedsunApiApplication.class, args);
  }

}
