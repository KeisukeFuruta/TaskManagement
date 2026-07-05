package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.repository.BoardRepository;
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
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @InjectMocks
    private BoardService boardService;

    @Test
    void findAll_delegatesToFindAllOrdered() {
        Board board = new Board();
        when(boardRepository.findAllOrdered()).thenReturn(List.of(board));

        List<Board> result = boardService.findAll();

        assertThat(result).containsExactly(board);
        verify(boardRepository).findAllOrdered();
    }

    @Test
    void findById_found_returnsBoard() {
        UUID id = UUID.randomUUID();
        Board board = new Board();
        when(boardRepository.findById(id)).thenReturn(Optional.of(board));

        Board result = boardService.findById(id);

        assertThat(result).isEqualTo(board);
    }

    @Test
    void findById_notFound_throws404() {
        UUID id = UUID.randomUUID();
        when(boardRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> boardService.findById(id))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void create_setsPositionFromCount() {
        Board board = new Board();
        board.setTitle("New Board");
        when(boardRepository.count()).thenReturn(3L);
        when(boardRepository.save(board)).thenReturn(board);

        boardService.create(board);

        assertThat(board.getPosition()).isEqualTo(3);
        verify(boardRepository).save(board);
    }

    @Test
    void update_updatesTitleOnly() {
        UUID id = UUID.randomUUID();
        Board existing = new Board();
        existing.setTitle("Old");
        Board body = new Board();
        body.setTitle("New");
        when(boardRepository.findById(id)).thenReturn(Optional.of(existing));
        when(boardRepository.save(existing)).thenReturn(existing);

        boardService.update(id, body);

        assertThat(existing.getTitle()).isEqualTo("New");
        verify(boardRepository).save(existing);
    }

    @Test
    void reorder_updatesEachPosition() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        Board b1 = new Board();
        Board b2 = new Board();
        when(boardRepository.findById(id1)).thenReturn(Optional.of(b1));
        when(boardRepository.findById(id2)).thenReturn(Optional.of(b2));

        ReorderRequest r1 = new ReorderRequest();
        r1.setId(id1);
        r1.setPosition(0);
        ReorderRequest r2 = new ReorderRequest();
        r2.setId(id2);
        r2.setPosition(1);

        boardService.reorder(List.of(r1, r2));

        assertThat(b1.getPosition()).isEqualTo(0);
        assertThat(b2.getPosition()).isEqualTo(1);
        verify(boardRepository).saveAll(any());
    }

    @Test
    void delete_notFound_throws404() {
        UUID id = UUID.randomUUID();
        when(boardRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> boardService.delete(id))
            .isInstanceOf(ResponseStatusException.class)
            .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void delete_success_callsDeleteById() {
        UUID id = UUID.randomUUID();
        when(boardRepository.existsById(id)).thenReturn(true);

        boardService.delete(id);

        verify(boardRepository).deleteById(id);
    }
}
