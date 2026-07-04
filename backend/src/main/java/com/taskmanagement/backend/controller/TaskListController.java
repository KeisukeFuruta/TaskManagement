package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.service.TaskListService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public TaskList create(@PathVariable UUID boardId, @RequestBody TaskList body) {
        return taskListService.create(boardId, body);
    }

    @PutMapping("/lists/{id}")
    public TaskList update(@PathVariable UUID id, @RequestBody TaskList body) {
        return taskListService.update(id, body);
    }

    @PatchMapping("/boards/{boardId}/lists/reorder")
    public ResponseEntity<Void> reorder(@PathVariable UUID boardId, @RequestBody List<ReorderRequest> items) {
        taskListService.reorderLists(boardId, items);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/lists/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        taskListService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
