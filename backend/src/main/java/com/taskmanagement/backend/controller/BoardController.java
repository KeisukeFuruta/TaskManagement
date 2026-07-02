package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.service.BoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public Board create(@RequestBody Board board) {
        return boardService.create(board);
    }

    @PutMapping("/{id}")
    public Board update(@PathVariable UUID id, @RequestBody Board body) {
        return boardService.update(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        boardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
