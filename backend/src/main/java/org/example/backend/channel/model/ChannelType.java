package org.example.backend.channel.model;

public enum ChannelType {
    VOICE("VOICE"),
    COUNSELING("COUNSELING");

    private final String value;

    ChannelType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ChannelType fromValue(String value) {
        for (ChannelType type : ChannelType.values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        return null;
    }
}