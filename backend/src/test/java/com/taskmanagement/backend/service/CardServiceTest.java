package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.CardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private TaskListRepository taskListRepository;

    @InjectMocks
    private CardService cardService;

    @Test
    void findByListId_listNotFound_throws404() {
        UUID listId = UUID.randomUUID();
        when(taskListRepository.existsById(listId)).thenReturn(false);

        assertThatThrownBy(() -> cardService.findByListId(listId))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void findByListId_success_returnsCards() {
        UUID listId = UUID.randomUUID();
        Card card = new Card();
        when(taskListRepository.existsById(listId)).thenReturn(true);
        when(cardRepository.findByTaskListIdOrderByPosition(listId)).thenReturn(List.of(card));

        List<Card> result = cardService.findByListId(listId);

        assertThat(result).containsExactly(card);
    }

    @Test
    void findById_found_returnsCard() {
        UUID id = UUID.randomUUID();
        Card card = new Card();
        when(cardRepository.findById(id)).thenReturn(Optional.of(card));

        Card result = cardService.findById(id);

        assertThat(result).isEqualTo(card);
    }

    @Test
    void findById_notFound_throws404() {
        UUID id = UUID.randomUUID();
        when(cardRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardService.findById(id))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void search_delegatesToRepository() {
        String title = "task";
        String priority = "HIGH";
        LocalDate dueDate = LocalDate.of(2025, 6, 1);
        Card card = new Card();
        when(cardRepository.searchCards(title, priority, dueDate)).thenReturn(List.of(card));

        List<Card> result = cardService.search(title, priority, dueDate);

        assertThat(result).containsExactly(card);
        verify(cardRepository).searchCards(title, priority, dueDate);
    }

    @Test
    void create_setsPositionAndTaskList() {
        UUID listId = UUID.randomUUID();
        TaskList taskList = new TaskList();
        Card body = new Card();
        body.setTitle("New Card");
        when(taskListRepository.findById(listId)).thenReturn(Optional.of(taskList));
        when(cardRepository.findByTaskListIdOrderByPosition(listId)).thenReturn(List.of());
        when(cardRepository.save(body)).thenReturn(body);

        cardService.create(listId, body);

        assertThat(body.getTaskList()).isEqualTo(taskList);
        assertThat(body.getPosition()).isEqualTo(0);
        verify(cardRepository).save(body);
    }

    @Test
    void create_listNotFound_throws404() {
        UUID listId = UUID.randomUUID();
        when(taskListRepository.findById(listId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardService.create(listId, new Card()))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void update_updatesAllFields() {
        UUID id = UUID.randomUUID();
        Card existing = new Card();
        Card body = new Card();
        body.setTitle("Updated");
        body.setMemo("memo");
        body.setPriority("HIGH");
        body.setDueDate(LocalDate.of(2025, 12, 31));
        body.setPosition(3);
        when(cardRepository.findById(id)).thenReturn(Optional.of(existing));
        when(cardRepository.save(existing)).thenReturn(existing);

        cardService.update(id, body);

        assertThat(existing.getTitle()).isEqualTo("Updated");
        assertThat(existing.getMemo()).isEqualTo("memo");
        assertThat(existing.getPriority()).isEqualTo("HIGH");
        assertThat(existing.getDueDate()).isEqualTo(LocalDate.of(2025, 12, 31));
        assertThat(existing.getPosition()).isEqualTo(3);
    }

    @Test
    void move_changesTaskListAndPosition() {
        UUID cardId = UUID.randomUUID();
        UUID newListId = UUID.randomUUID();
        Card card = new Card();
        TaskList newList = new TaskList();
        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(taskListRepository.findById(newListId)).thenReturn(Optional.of(newList));
        when(cardRepository.save(card)).thenReturn(card);

        cardService.move(cardId, newListId, 2);

        assertThat(card.getTaskList()).isEqualTo(newList);
        assertThat(card.getPosition()).isEqualTo(2);
    }

    @Test
    void reorderCards_listNotFound_throws404() {
        UUID listId = UUID.randomUUID();
        when(taskListRepository.existsById(listId)).thenReturn(false);

        assertThatThrownBy(() -> cardService.reorderCards(listId, List.of()))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void reorderCards_cardNotFound_throws404() {
        UUID listId = UUID.randomUUID();
        UUID cardId = UUID.randomUUID();
        when(taskListRepository.existsById(listId)).thenReturn(true);
        when(cardRepository.findById(cardId)).thenReturn(Optional.empty());

        ReorderRequest req = new ReorderRequest();
        req.setId(cardId);
        req.setPosition(0);

        assertThatThrownBy(() -> cardService.reorderCards(listId, List.of(req)))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void reorderCards_success_updatesPositions() {
        UUID listId = UUID.randomUUID();
        UUID cardId = UUID.randomUUID();
        Card card = new Card();
        when(taskListRepository.existsById(listId)).thenReturn(true);
        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));

        ReorderRequest req = new ReorderRequest();
        req.setId(cardId);
        req.setPosition(4);

        cardService.reorderCards(listId, List.of(req));

        assertThat(card.getPosition()).isEqualTo(4);
        verify(cardRepository).saveAll(any());
    }

    @Test
    void delete_notFound_throws404() {
        UUID id = UUID.randomUUID();
        when(cardRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> cardService.delete(id))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void delete_success_callsDeleteById() {
        UUID id = UUID.randomUUID();
        when(cardRepository.existsById(id)).thenReturn(true);

        cardService.delete(id);

        verify(cardRepository).deleteById(id);
    }
}
