package kh.edu.istad.subscriber.sink;

import kh.edu.istad.subscriber.domain.entity.Notification;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Sinks;
import reactor.util.concurrent.Queues;

@Component
public class NotificationSink {

    private final Sinks.Many<Notification> sink = Sinks.many().multicast().onBackpressureBuffer(
            Queues.SMALL_BUFFER_SIZE, false
    );

    public Sinks.Many<Notification> getSink() {
        return sink;
    }

}
