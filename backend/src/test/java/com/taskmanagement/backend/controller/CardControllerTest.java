package com.taskmanagement.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanagement.backend.dto.MoveCardRequest;
import com.taskmanagement.backend.dto.ReorderRequest;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.service.CardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
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

@WebMvcTest(CardController.class)
class CardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CardService cardService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getByList_returns200() throws Exception {
        UUID listId = UUID.randomUUID();
        Card card = new Card();
        card.setTitle("My Card");
        when(cardService.findByListId(listId)).thenReturn(List.of(card));

        mockMvc.perform(get("/lists/{listId}/cards", listId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("My Card"));
    }

    @Test
    void getById_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        Card card = new Card();
        card.setTitle("My Card");
        when(cardService.findById(id)).thenReturn(card);

        mockMvc.perform(get("/cards/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("My Card"));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(cardService.findById(id))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/cards/{id}", id))
            .andExpect(status().isNotFound());
    }

    @Test
    void search_withParams_returns200() throws Exception {
        Card card = new Card();
        card.setTitle("Task");
        when(cardService.search(any(), any(), any())).thenReturn(List.of(card));

        mockMvc.perform(get("/cards/search")
                .param("title", "Task")
                .param("priority", "HIGH"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Task"));
    }

    @Test
    void search_withNoParams_returns200() throws Exception {
        when(cardService.search(any(), any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/cards/search"))
            .andExpect(status().isOk());
    }

    @Test
    void create_withValidBody_returns201() throws Exception {
        UUID listId = UUID.randomUUID();
        Card body = new Card();
        body.setTitle("New Card");
        Card saved = new Card();
        saved.setTitle("New Card");
        when(cardService.create(any(), any())).thenReturn(saved);

        mockMvc.perform(post("/lists/{listId}/cards", listId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("New Card"));
    }

    @Test
    void create_withBlankTitle_returns400() throws Exception {
        UUID listId = UUID.randomUUID();
        Card body = new Card();
        body.setTitle("");

        mockMvc.perform(post("/lists/{listId}/cards", listId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void update_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        Card body = new Card();
        body.setTitle("Updated");
        body.setDueDate(LocalDate.of(2025, 12, 31));
        Card updated = new Card();
        updated.setTitle("Updated");
        when(cardService.update(any(), any())).thenReturn(updated);

        mockMvc.perform(put("/cards/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Updated"));
    }

    @Test
    void move_withValidBody_returns200() throws Exception {
        UUID id = UUID.randomUUID();
        MoveCardRequest req = new MoveCardRequest();
        req.setListId(UUID.randomUUID());
        req.setPosition(1);
        Card moved = new Card();
        moved.setTitle("Moved Card");
        when(cardService.move(any(), any(), any(Integer.class))).thenReturn(moved);

        mockMvc.perform(patch("/cards/{id}/move", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk());
    }

    @Test
    void move_withNullListId_returns400() throws Exception {
        UUID id = UUID.randomUUID();
        MoveCardRequest req = new MoveCardRequest();
        req.setPosition(0);

        mockMvc.perform(patch("/cards/{id}/move", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void reorder_returns204() throws Exception {
        UUID listId = UUID.randomUUID();
        ReorderRequest req = new ReorderRequest();
        req.setId(UUID.randomUUID());
        req.setPosition(0);

        mockMvc.perform(patch("/lists/{listId}/cards/reorder", listId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(req))))
            .andExpect(status().isNoContent());
    }

    @Test
    void reorder_withNullId_returns400() throws Exception {
        UUID listId = UUID.randomUUID();
        ReorderRequest req = new ReorderRequest();
        req.setPosition(0);

        mockMvc.perform(patch("/lists/{listId}/cards/reorder", listId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(req))))
            .andExpect(status().isBadRequest());
    }

    @Test
    void delete_returns204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/cards/{id}", id))
            .andExpect(status().isNoContent());
    }

    @Test
    void delete_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
            .when(cardService).delete(any());

        mockMvc.perform(delete("/cards/{id}", id))
            .andExpect(status().isNotFound());
    }
}
