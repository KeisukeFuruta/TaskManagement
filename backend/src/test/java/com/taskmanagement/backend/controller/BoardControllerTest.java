package com.taskmanagement.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.service.BoardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

@WebMvcTest(BoardController.class)
class BoardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BoardService boardService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getAll_returns200() throws Exception {
        Board board = new Board();
        board.setTitle("Test Board");
        when(boardService.findAll()).thenReturn(List.of(board));

        mockMvc.perform(get("/boards"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Test Board"));
    }

    @Test
    void getById_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        Board board = new Board();
        board.setTitle("Test Board");
        when(boardService.findById(id)).thenReturn(board);

        mockMvc.perform(get("/boards/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Test Board"));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(boardService.findById(id))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/boards/{id}", id))
            .andExpect(status().isNotFound());
    }

    @Test
    void create_withValidBody_returns201() throws Exception {
        Board body = new Board();
        body.setTitle("New Board");
        Board saved = new Board();
        saved.setTitle("New Board");
        when(boardService.create(any())).thenReturn(saved);

        mockMvc.perform(post("/boards")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("New Board"));
    }

    @Test
    void create_withBlankTitle_returns400() throws Exception {
        Board body = new Board();
        body.setTitle("");

        mockMvc.perform(post("/boards")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void update_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        Board body = new Board();
        body.setTitle("Updated");
        Board updated = new Board();
        updated.setTitle("Updated");
        when(boardService.update(any(), any())).thenReturn(updated);

        mockMvc.perform(put("/boards/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Updated"));
    }

    @Test
    void delete_returns204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/boards/{id}", id))
            .andExpect(status().isNoContent());
    }

    @Test
    void delete_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
            .when(boardService).delete(any());

        mockMvc.perform(delete("/boards/{id}", id))
            .andExpect(status().isNotFound());
    }

    @Test
    void reorder_returns204() throws Exception {
        ReorderRequest req = new ReorderRequest();
        req.setId(UUID.randomUUID());
        req.setPosition(0);

        mockMvc.perform(patch("/boards/reorder")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(req))))
            .andExpect(status().isNoContent());
    }
}
