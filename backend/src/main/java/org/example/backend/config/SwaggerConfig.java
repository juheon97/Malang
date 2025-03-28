package org.example.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Malang API 문서")
                        .version("1.0")
                        .description("Malang 서비스 API 문서입니다")
                        .contact(new Contact().name("D110 SSAFY TEAM")))
                .servers(List.of(
                        new Server().url("/api").description("API Server")
                ));
    }
}
