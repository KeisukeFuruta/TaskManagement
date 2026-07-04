package com.taskmanagement.backend.service;

import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.repository.BoardRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class BoardService {

    private final BoardRepository boardRepository;

    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    public List<Board> findAll() {
        return boardRepository.findAllByOrderByCreatedAtAsc();
    }

    public Board findById(UUID id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Board create(Board board) {
        return boardRepository.save(board);
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
