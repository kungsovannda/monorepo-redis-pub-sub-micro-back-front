package kh.edu.istad.publisher.dto;

import java.util.List;

public record PlaceOrderRequest(
        String customer,
        List<String> products
) {
}
