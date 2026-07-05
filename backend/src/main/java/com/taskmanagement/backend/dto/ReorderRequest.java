package com.taskmanagement.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class ReorderRequest {

    @NotNull
    private UUID id;
    private int position;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }
}
