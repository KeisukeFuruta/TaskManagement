package com.taskmanagement.backend.dto;

import java.util.UUID;

public class MoveCardRequest {
    private UUID listId;
    private int position;

    public UUID getListId() { return listId; }
    public void setListId(UUID listId) { this.listId = listId; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
}
