package com.carboncredit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(exclude = {
        com.google.cloud.spring.autoconfigure.core.GcpContextAutoConfiguration.class,
        com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration.class
})
@EnableJpaAuditing
@EnableAsync
public class CarboncreditApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarboncreditApplication.class, args);
    }

}
