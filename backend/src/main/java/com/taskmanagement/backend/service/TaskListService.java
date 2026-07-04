package com.taskmanagement.backend.service;

import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.repository.BoardRepository;
import com.taskmanagement.backend.repository.TaskListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class TaskListService {

    private final TaskListRepository taskListRepository;
    private final BoardRepository boardRepository;

    public TaskListService(TaskListRepository taskListRepository, BoardRepository boardRepository) {
        this.taskListRepository = taskListRepository;
        this.boardRepository = boardRepository;
    }

    public List<TaskList> findByBoardId(UUID boardId) {
        if (!boardRepository.existsById(boardId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return taskListRepository.findByBoardIdOrderByPosition(boardId);
    }

    public TaskList create(UUID boardId, TaskList body) {
        return boardRepository.findById(boardId).map(board -> {
            int pos = taskListRepository.findByBoardIdOrderByPosition(boardId).size();
            body.setBoard(board);
            body.setPosition(pos);
            return taskListRepository.save(body);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public TaskList update(UUID id, TaskList body) {
        return taskListRepository.findById(id).map(list -> {
            list.setTitle(body.getTitle());
            list.setPosition(body.getPosition());
            return taskListRepository.save(list);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public void reorderLists(UUID boardId, List<ReorderRequest> items) {
        if (!boardRepository.existsById(boardId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        List<TaskList> lists = new ArrayList<>();
        for (ReorderRequest item : items) {
            UUID id = Objects.requireNonNull(item.getId());
            TaskList list = taskListRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            list.setPosition(item.getPosition());
            lists.add(list);
        }
        taskListRepository.saveAll(lists);
    }

    public void delete(UUID id) {
        if (!taskListRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        taskListRepository.deleteById(id);
    }
}
