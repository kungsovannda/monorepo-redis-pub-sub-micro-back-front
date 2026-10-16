package kh.edu.istad.subscriber.message.subscriber;

import kh.edu.istad.common.domain.constant.EventTopic;
import kh.edu.istad.common.domain.event.OrderPlacedEvent;
import kh.edu.istad.subscriber.domain.constant.NotificationType;
import kh.edu.istad.subscriber.domain.entity.Notification;
import kh.edu.istad.subscriber.domain.usecase.CreateNotificationUseCase;
import org.springframework.data.redis.annotation.RedisListener;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
public class OrderSubscriber {

    private final CreateNotificationUseCase createNotificationUseCase;

    public OrderSubscriber(CreateNotificationUseCase createNotificationUseCase) {
        this.createNotificationUseCase = createNotificationUseCase;
    }

    @RedisListener(topic = EventTopic.Order.PLACED, consumes = MediaType.APPLICATION_JSON_VALUE)
    public void process(OrderPlacedEvent event){
        var details = new HashMap<String, Object>();
        details.put("orderId", event.orderId().toString());
        details.put("customer", event.customer());
        details.put("products", event.products());
        Notification notification = new Notification(
                NotificationType.ORDER_PLACED,
                details
        );
        createNotificationUseCase.create(notification);
    }

}
