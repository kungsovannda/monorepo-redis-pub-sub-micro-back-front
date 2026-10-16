package kh.edu.istad.common.domain.entity;

import kh.edu.istad.common.domain.valueobject.BaseId;

import java.util.UUID;

public class BaseEntity {

    private final BaseId id;

    public BaseEntity() {
        this(new BaseId(UUID.randomUUID()));
    }

    public BaseEntity(BaseId id){
        this.id = id;
    }

    public BaseId getId() {
        return id;
    }

}
