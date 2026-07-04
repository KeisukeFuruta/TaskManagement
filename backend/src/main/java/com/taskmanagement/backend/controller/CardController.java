package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.MoveCardRequest;
import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.service.CardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping("/lists/{listId}/cards")
    public List<Card> getByList(@PathVariable UUID listId) {
        return cardService.findByListId(listId);
    }

    @GetMapping("/cards/{id}")
    public Card getById(@PathVariable UUID id) {
        return cardService.findById(id);
    }

    @GetMapping("/cards/search")
    public List<Card> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate) {
        return cardService.search(title, priority, dueDate);
    }

    @PostMapping("/lists/{listId}/cards")
    public Card create(@PathVariable UUID listId, @RequestBody Card body) {
        return cardService.create(listId, body);
    }

    @PutMapping("/cards/{id}")
    public Card update(@PathVariable UUID id, @RequestBody Card body) {
        return cardService.update(id, body);
    }

    @PatchMapping("/cards/{id}/move")
    public Card move(@PathVariable UUID id, @RequestBody MoveCardRequest body) {
        return cardService.move(id, body.getListId(), body.getPosition());
    }

    @PatchMapping("/lists/{listId}/cards/reorder")
    public ResponseEntity<Void> reorder(@PathVariable UUID listId, @RequestBody List<ReorderRequest> items) {
        cardService.reorderCards(listId, items);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        cardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
