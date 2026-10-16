package kh.edu.istad.subscriber;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.redis.annotation.EnableRedisListeners;

@SpringBootApplication
public class SubscriberApplication {

    public static void main(String[] args) {
        SpringApplication.run(SubscriberApplication.class, args);
    }

}
