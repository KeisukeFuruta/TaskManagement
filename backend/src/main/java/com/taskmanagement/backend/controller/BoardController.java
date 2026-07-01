package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.repository.BoardRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/boards")
public class BoardController {

    private final BoardRepository boardRepository;

    public BoardController(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    @GetMapping
    public List<Board> getAll() {
        return boardRepository.findAll();
    }

    @PostMapping
    public Board create(@RequestBody Board board) {
        return boardRepository.save(board);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Board> update(@PathVariable UUID id, @RequestBody Board body) {
        return boardRepository.findById(id).map(board -> {
            board.setTitle(body.getTitle());
            return ResponseEntity.ok(boardRepository.save(board));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!boardRepository.existsById(id)) return ResponseEntity.notFound().build();
        boardRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
