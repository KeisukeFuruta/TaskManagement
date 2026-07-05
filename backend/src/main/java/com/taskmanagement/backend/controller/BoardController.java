package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/boards")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public List<Board> getAll() {
        return boardService.findAll();
    }

    @GetMapping("/{id}")
    public Board getById(@PathVariable UUID id) {
        return boardService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Board> create(@Valid @RequestBody Board board) {
        return ResponseEntity.status(HttpStatus.CREATED).body(boardService.create(board));
    }

    @PutMapping("/{id}")
    public Board update(@PathVariable UUID id, @Valid @RequestBody Board body) {
        return boardService.update(id, body);
    }

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<ReorderRequest> items) {
        boardService.reorder(items);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        boardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
