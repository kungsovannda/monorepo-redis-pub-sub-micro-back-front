package kh.edu.istad.common.domain.valueobject;

import java.util.UUID;

public record BaseId(
        UUID value
) {

    public static BaseId fromString(String str){
        return new BaseId(UUID.fromString(str));
    }

    public static BaseId generate(){
        return new BaseId(UUID.randomUUID());
    }

    @Override
    public boolean equals(Object obj) {
        if(obj instanceof BaseId(UUID that)){
            return that.equals(this.value());
        }
        return false;
    }

    @Override
    public String toString() {
        return value().toString();
    }
}
