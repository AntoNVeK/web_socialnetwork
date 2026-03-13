package com.kornienko.social.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.*;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.kornienko.social.repository")
public class MongoConfig {

    @Bean
    public MongoClient mongoClient() {

        String uri = "mongodb://admin:adminpass@localhost:27018/social_messages?authSource=admin";
        System.out.println(">>> Инициализация MongoDB с URI: " + uri);
        return MongoClients.create(uri);
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), "social_messages");
    }

    @Bean
    public MappingMongoConverter mappingMongoConverter() {
        DbRefResolver dbRefResolver = new DefaultDbRefResolver(mongoTemplate().getMongoDatabaseFactory());
        MappingMongoConverter converter = new MappingMongoConverter(dbRefResolver, new MongoMappingContext());

        converter.setTypeMapper(new DefaultMongoTypeMapper(null));

        return converter;
    }
}
