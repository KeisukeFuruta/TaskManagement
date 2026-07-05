package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskListServiceTest {

    @Mock
    private TaskListRepository taskListRepository;

    @Mock
    private BoardRepository boardRepository;

    @InjectMocks
    private TaskListService taskListService;

    @Test
    void findByBoardId_boardNotFound_throws404() {
        UUID boardId = UUID.randomUUID();
        when(boardRepository.existsById(boardId)).thenReturn(false);

        assertThatThrownBy(() -> taskListService.findByBoardId(boardId))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void findByBoardId_success_returnsList() {
        UUID boardId = UUID.randomUUID();
        TaskList list = new TaskList();
        when(boardRepository.existsById(boardId)).thenReturn(true);
        when(taskListRepository.findByBoardIdOrderByPosition(boardId)).thenReturn(List.of(list));

        List<TaskList> result = taskListService.findByBoardId(boardId);

        assertThat(result).containsExactly(list);
    }

    @Test
    void create_setsPositionAndBoard() {
        UUID boardId = UUID.randomUUID();
        Board board = new Board();
        TaskList body = new TaskList();
        body.setTitle("New List");
        when(boardRepository.findById(boardId)).thenReturn(Optional.of(board));
        when(taskListRepository.findByBoardIdOrderByPosition(boardId)).thenReturn(List.of());
        when(taskListRepository.save(body)).thenReturn(body);

        taskListService.create(boardId, body);

        assertThat(body.getBoard()).isEqualTo(board);
        assertThat(body.getPosition()).isEqualTo(0);
        verify(taskListRepository).save(body);
    }

    @Test
    void create_boardNotFound_throws404() {
        UUID boardId = UUID.randomUUID();
        when(boardRepository.findById(boardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskListService.create(boardId, new TaskList()))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void update_updatesTitleAndPosition() {
        UUID id = UUID.randomUUID();
        TaskList existing = new TaskList();
        existing.setTitle("Old");
        existing.setPosition(0);
        TaskList body = new TaskList();
        body.setTitle("New");
        body.setPosition(2);
        when(taskListRepository.findById(id)).thenReturn(Optional.of(existing));
        when(taskListRepository.save(existing)).thenReturn(existing);

        taskListService.update(id, body);

        assertThat(existing.getTitle()).isEqualTo("New");
        assertThat(existing.getPosition()).isEqualTo(2);
    }

    @Test
    void reorderLists_boardNotFound_throws404() {
        UUID boardId = UUID.randomUUID();
        when(boardRepository.existsById(boardId)).thenReturn(false);

        assertThatThrownBy(() -> taskListService.reorderLists(boardId, List.of()))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void reorderLists_success_updatesPositions() {
        UUID boardId = UUID.randomUUID();
        UUID listId = UUID.randomUUID();
        TaskList list = new TaskList();
        when(boardRepository.existsById(boardId)).thenReturn(true);
        when(taskListRepository.findById(listId)).thenReturn(Optional.of(list));

        ReorderRequest req = new ReorderRequest();
        req.setId(listId);
        req.setPosition(5);

        taskListService.reorderLists(boardId, List.of(req));

        assertThat(list.getPosition()).isEqualTo(5);
        verify(taskListRepository).saveAll(any());
    }

    @Test
    void delete_notFound_throws404() {
        UUID id = UUID.randomUUID();
        when(taskListRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> taskListService.delete(id))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void delete_success_callsDeleteById() {
        UUID id = UUID.randomUUID();
        when(taskListRepository.existsById(id)).thenReturn(true);

        taskListService.delete(id);

        verify(taskListRepository).deleteById(id);
    }
}
