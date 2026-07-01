package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class TaskListController {

    private final TaskListRepository taskListRepository;
    private final BoardRepository boardRepository;

    public TaskListController(TaskListRepository taskListRepository, BoardRepository boardRepository) {
        this.taskListRepository = taskListRepository;
        this.boardRepository = boardRepository;
    }

    @GetMapping("/boards/{boardId}/lists")
    public ResponseEntity<List<TaskList>> getByBoard(@PathVariable UUID boardId) {
        if (!boardRepository.existsById(boardId)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(taskListRepository.findByBoardIdOrderByPosition(boardId));
    }

    @PostMapping("/boards/{boardId}/lists")
    public ResponseEntity<TaskList> create(@PathVariable UUID boardId, @RequestBody TaskList body) {
        return boardRepository.findById(boardId).map(board -> {
            body.setBoard(board);
            return ResponseEntity.ok(taskListRepository.save(body));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/lists/{id}")
    public ResponseEntity<TaskList> update(@PathVariable UUID id, @RequestBody TaskList body) {
        return taskListRepository.findById(id).map(list -> {
            list.setTitle(body.getTitle());
            list.setPosition(body.getPosition());
            return ResponseEntity.ok(taskListRepository.save(list));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/lists/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!taskListRepository.existsById(id)) return ResponseEntity.notFound().build();
        taskListRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
