package com.taskmanagement.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.service.TaskListService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskListController.class)
class TaskListControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskListService taskListService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getByBoard_returns200() throws Exception {
        UUID boardId = UUID.randomUUID();
        TaskList list = new TaskList();
        list.setTitle("List A");
        when(taskListService.findByBoardId(boardId)).thenReturn(List.of(list));

        mockMvc.perform(get("/boards/{boardId}/lists", boardId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("List A"));
    }

    @Test
    void getByBoard_notFound_returns404() throws Exception {
        UUID boardId = UUID.randomUUID();
        when(taskListService.findByBoardId(boardId))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/boards/{boardId}/lists", boardId))
            .andExpect(status().isNotFound());
    }

    @Test
    void create_withValidBody_returns201() throws Exception {
        UUID boardId = UUID.randomUUID();
        TaskList body = new TaskList();
        body.setTitle("New List");
        TaskList saved = new TaskList();
        saved.setTitle("New List");
        when(taskListService.create(any(), any())).thenReturn(saved);

        mockMvc.perform(post("/boards/{boardId}/lists", boardId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("New List"));
    }

    @Test
    void create_withBlankTitle_returns400() throws Exception {
        UUID boardId = UUID.randomUUID();
        TaskList body = new TaskList();
        body.setTitle("");

        mockMvc.perform(post("/boards/{boardId}/lists", boardId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void update_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        TaskList body = new TaskList();
        body.setTitle("Updated");
        TaskList updated = new TaskList();
        updated.setTitle("Updated");
        when(taskListService.update(any(), any())).thenReturn(updated);

        mockMvc.perform(put("/lists/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Updated"));
    }

    @Test
    void delete_returns204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/lists/{id}", id))
            .andExpect(status().isNoContent());
    }

    @Test
    void delete_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
            .when(taskListService).delete(any());

        mockMvc.perform(delete("/lists/{id}", id))
            .andExpect(status().isNotFound());
    }

    @Test
    void reorder_returns204() throws Exception {
        UUID boardId = UUID.randomUUID();
        ReorderRequest req = new ReorderRequest();
        req.setId(UUID.randomUUID());
        req.setPosition(0);

        mockMvc.perform(patch("/boards/{boardId}/lists/reorder", boardId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(req))))
            .andExpect(status().isNoContent());
    }

    @Test
    void reorder_withNullId_returns400() throws Exception {
        UUID boardId = UUID.randomUUID();
        ReorderRequest req = new ReorderRequest();
        req.setPosition(0);

        mockMvc.perform(patch("/boards/{boardId}/lists/reorder", boardId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(req))))
            .andExpect(status().isBadRequest());
    }
}
