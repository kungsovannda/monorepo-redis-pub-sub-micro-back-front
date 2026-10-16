package kh.edu.istad.publisher.domain.entity;

import kh.edu.istad.common.domain.entity.BaseEntity;

import java.util.List;

public class Order extends BaseEntity {

    private String customer;

    private List<String> products;

    public Order() {
        this("N/A", List.of());
    }

    public Order(String customer, List<String> products) {
        super();
        setCustomer(customer);
        setProducts(products);
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public List<String> getProducts() {
        return products;
    }

    public void setProducts(List<String> products) {
        this.products = products;
    }
}
