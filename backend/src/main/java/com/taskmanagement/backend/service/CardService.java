package com.taskmanagement.backend.service;

import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final TaskListRepository taskListRepository;

    public CardService(CardRepository cardRepository, TaskListRepository taskListRepository) {
        this.cardRepository = cardRepository;
        this.taskListRepository = taskListRepository;
    }

    public List<Card> findByListId(UUID listId) {
        if (!taskListRepository.existsById(listId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return cardRepository.findByTaskListIdOrderByPosition(listId);
    }

    public Card findById(UUID id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public List<Card> search(String title, String priority, LocalDate dueDate) {
        return cardRepository.searchCards(title, priority, dueDate);
    }

    public Card create(UUID listId, Card body) {
        return taskListRepository.findById(listId).map(list -> {
            int pos = cardRepository.findByTaskListIdOrderByPosition(listId).size();
            body.setTaskList(list);
            body.setPosition(pos);
            return cardRepository.save(body);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Card update(UUID id, Card body) {
        return cardRepository.findById(id).map(card -> {
            card.setTitle(body.getTitle());
            card.setMemo(body.getMemo());
            card.setPriority(body.getPriority());
            card.setDueDate(body.getDueDate());
            card.setPosition(body.getPosition());
            return cardRepository.save(card);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public void delete(UUID id) {
        if (!cardRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        cardRepository.deleteById(id);
    }
}
