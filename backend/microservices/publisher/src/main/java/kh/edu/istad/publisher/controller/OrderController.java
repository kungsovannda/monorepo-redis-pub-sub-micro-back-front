package kh.edu.istad.publisher.controller;

import kh.edu.istad.publisher.domain.entity.Order;
import kh.edu.istad.publisher.domain.usecase.PlaceOrderUseCase;
import kh.edu.istad.publisher.dto.PlaceOrderRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/orders")
@RestController
public class OrderController {

    private final PlaceOrderUseCase placeOrderUseCase;

    public OrderController(PlaceOrderUseCase placeOrderUseCase) {
        this.placeOrderUseCase = placeOrderUseCase;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void placeOrder(@RequestBody PlaceOrderRequest request){
        placeOrderUseCase.place(new Order(request.customer(), request.products()));
    }

}
