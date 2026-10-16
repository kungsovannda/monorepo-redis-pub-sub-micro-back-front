package kh.edu.istad.subscriber.domain.usecase;

import kh.edu.istad.subscriber.domain.entity.Notification;
import kh.edu.istad.subscriber.sink.NotificationSink;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Sinks;

import java.time.Duration;

@Service
public class CreateNotificationUseCase {

    private final NotificationSink notificationSink;

    public CreateNotificationUseCase(NotificationSink notificationSink) {
        this.notificationSink = notificationSink;
    }

    public void create(Notification notification){
        notificationSink.getSink().emitNext(notification, Sinks.EmitFailureHandler.busyLooping(Duration.ofSeconds(1)));
    }

}
