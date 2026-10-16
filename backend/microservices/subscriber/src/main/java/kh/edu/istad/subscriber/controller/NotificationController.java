package kh.edu.istad.subscriber.controller;

import kh.edu.istad.subscriber.dto.NotificationResponse;
import kh.edu.istad.subscriber.sink.NotificationSink;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/notifications/stream")
public class NotificationController {

    private final NotificationSink notificationSink;

    public NotificationController(NotificationSink notificationSink) {
        this.notificationSink = notificationSink;
    }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<NotificationResponse>> streamSubscriber() {
        Flux<ServerSentEvent<NotificationResponse>> events = notificationSink.getSink().asFlux()
                .map(n -> ServerSentEvent.builder(new NotificationResponse(
                        n.getId().toString(), n.getType(), n.getDetails())).build());

        Flux<ServerSentEvent<NotificationResponse>> heartbeat = Flux.interval(Duration.ofSeconds(15))
                .map(i -> ServerSentEvent.<NotificationResponse>builder().comment("ping").build());

        return Flux.merge(events, heartbeat);
    }

}
