package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.MoveCardRequest;
import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.service.CardService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<Card> create(@PathVariable UUID listId, @Valid @RequestBody Card body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cardService.create(listId, body));
    }

    @PutMapping("/cards/{id}")
    public Card update(@PathVariable UUID id, @Valid @RequestBody Card body) {
        return cardService.update(id, body);
    }

    @PatchMapping("/cards/{id}/move")
    public Card move(@PathVariable UUID id, @Valid @RequestBody MoveCardRequest body) {
        return cardService.move(id, body.getListId(), body.getPosition());
    }

    @PatchMapping("/lists/{listId}/cards/reorder")
    public ResponseEntity<Void> reorder(
            @PathVariable UUID listId, @Valid @RequestBody List<ReorderRequest> items) {
        cardService.reorderCards(listId, items);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        cardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
