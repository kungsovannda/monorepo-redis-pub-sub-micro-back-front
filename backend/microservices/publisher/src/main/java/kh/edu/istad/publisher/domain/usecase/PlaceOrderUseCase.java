package kh.edu.istad.publisher.domain.usecase;

import kh.edu.istad.common.domain.constant.EventTopic;
import kh.edu.istad.common.domain.event.OrderPlacedEvent;
import kh.edu.istad.common.domain.valueobject.BaseId;
import kh.edu.istad.publisher.domain.entity.Order;
import kh.edu.istad.publisher.message.publisher.DomainEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class PlaceOrderUseCase {

    private final DomainEventPublisher domainEventPublisher;

    public PlaceOrderUseCase(DomainEventPublisher domainEventPublisher) {
        this.domainEventPublisher = domainEventPublisher;
    }


    public void place(Order order){
        domainEventPublisher.publish(
                EventTopic.Order.PLACED,
                new OrderPlacedEvent(
                        BaseId.generate(),
                        order.getCustomer(),
                        order.getId(),
                        order.getProducts()
                )
        );
    }
}
