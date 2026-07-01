package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class CardController {

    private final CardRepository cardRepository;
    private final TaskListRepository taskListRepository;

    public CardController(CardRepository cardRepository, TaskListRepository taskListRepository) {
        this.cardRepository = cardRepository;
        this.taskListRepository = taskListRepository;
    }

    @GetMapping("/lists/{listId}/cards")
    public ResponseEntity<List<Card>> getByList(@PathVariable UUID listId) {
        if (!taskListRepository.existsById(listId)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(cardRepository.findByTaskListIdOrderByPosition(listId));
    }

    @PostMapping("/lists/{listId}/cards")
    public ResponseEntity<Card> create(@PathVariable UUID listId, @RequestBody Card body) {
        return taskListRepository.findById(listId).map(list -> {
            body.setTaskList(list);
            return ResponseEntity.ok(cardRepository.save(body));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/cards/{id}")
    public ResponseEntity<Card> update(@PathVariable UUID id, @RequestBody Card body) {
        return cardRepository.findById(id).map(card -> {
            card.setTitle(body.getTitle());
            card.setMemo(body.getMemo());
            card.setPriority(body.getPriority());
            card.setDueDate(body.getDueDate());
            card.setPosition(body.getPosition());
            return ResponseEntity.ok(cardRepository.save(card));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!cardRepository.existsById(id)) return ResponseEntity.notFound().build();
        cardRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
