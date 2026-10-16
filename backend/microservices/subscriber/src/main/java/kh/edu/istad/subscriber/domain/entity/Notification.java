package kh.edu.istad.subscriber.domain.entity;

import kh.edu.istad.common.domain.entity.BaseEntity;
import kh.edu.istad.common.domain.valueobject.BaseId;
import kh.edu.istad.subscriber.domain.constant.NotificationType;

import java.util.Map;

public class Notification extends BaseEntity {

    private NotificationType type;

    private Map<String, Object> details;

    public Notification(NotificationType type, Map<String, Object> details) {
        this.type = type;
        this.details = details;
    }

    public Notification(BaseId id, NotificationType type, Map<String, Object> details) {
        this.type = type;
        this.details = details;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }
}
