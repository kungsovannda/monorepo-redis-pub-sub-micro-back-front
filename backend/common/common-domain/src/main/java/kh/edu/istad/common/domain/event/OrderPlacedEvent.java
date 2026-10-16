package kh.edu.istad.common.domain.event;

import kh.edu.istad.common.domain.valueobject.BaseId;

import java.io.Serializable;
import java.util.List;

public record OrderPlacedEvent(

        BaseId eventId,

        String customer,

        BaseId orderId,

        List<String> products

) implements Serializable {
}
