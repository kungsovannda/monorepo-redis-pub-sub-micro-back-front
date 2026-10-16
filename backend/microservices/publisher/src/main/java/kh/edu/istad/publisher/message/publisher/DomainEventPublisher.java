package kh.edu.istad.publisher.message.publisher;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
public class DomainEventPublisher {

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public DomainEventPublisher(StringRedisTemplate stringRedisTemplate, ObjectMapper objectMapper) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public void publish(String channel, Object event){
        String json = objectMapper.writeValueAsString(event);
        stringRedisTemplate.convertAndSend(channel, json);
    }

}
