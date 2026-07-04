package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.repository.BoardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class BoardService {

    private final BoardRepository boardRepository;

    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    public List<Board> findAll() {
        return boardRepository.findAllOrdered();
    }

    public Board findById(UUID id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Board create(Board board) {
        int nextPosition = (int) boardRepository.count();
        board.setPosition(nextPosition);
        return boardRepository.save(board);
    }

    @Transactional
    public void reorder(List<ReorderRequest> items) {
        List<Board> boards = new ArrayList<>();
        for (ReorderRequest item : items) {
            UUID id = Objects.requireNonNull(item.getId());
            Board board = findById(id);
            board.setPosition(item.getPosition());
            boards.add(board);
        }
        boardRepository.saveAll(boards);
    }

    public Board update(UUID id, Board body) {
        Board board = findById(id);
        board.setTitle(body.getTitle());
        return boardRepository.save(board);
    }

    public void delete(UUID id) {
        if (!boardRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        boardRepository.deleteById(id);
    }
}
