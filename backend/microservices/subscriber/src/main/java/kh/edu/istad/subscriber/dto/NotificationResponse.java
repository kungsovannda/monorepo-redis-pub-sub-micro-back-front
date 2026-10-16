package kh.edu.istad.subscriber.dto;

import kh.edu.istad.subscriber.domain.constant.NotificationType;

import java.util.Map;

public record NotificationResponse(
        String id,
        NotificationType type,
        Map<String, Object> details
) {
}
