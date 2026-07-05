package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.service.TaskListService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
public class TaskListController {

    private final TaskListService taskListService;

    public TaskListController(TaskListService taskListService) {
        this.taskListService = taskListService;
    }

    @GetMapping("/boards/{boardId}/lists")
    public List<TaskList> getByBoard(@PathVariable UUID boardId) {
        return taskListService.findByBoardId(boardId);
    }

    @PostMapping("/boards/{boardId}/lists")
    public ResponseEntity<TaskList> create(
            @PathVariable UUID boardId, @Valid @RequestBody TaskList body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskListService.create(boardId, body));
    }

    @PutMapping("/lists/{id}")
    public TaskList update(@PathVariable UUID id, @Valid @RequestBody TaskList body) {
        return taskListService.update(id, body);
    }

    @PatchMapping("/boards/{boardId}/lists/reorder")
    public ResponseEntity<Void> reorder(
            @PathVariable UUID boardId, @RequestBody List<ReorderRequest> items) {
        taskListService.reorderLists(boardId, items);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/lists/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        taskListService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
