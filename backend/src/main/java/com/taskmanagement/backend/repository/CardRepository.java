package com.taskmanagement.backend.repository;

import com.taskmanagement.backend.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {

    List<Card> findByTaskListIdOrderByPosition(UUID taskListId);

    @Query("SELECT c FROM Card c WHERE "
            + "(:title IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND "
            + "(:priority IS NULL OR c.priority = :priority) AND "
            + "(:dueDate IS NULL OR c.dueDate = :dueDate) "
            + "ORDER BY c.dueDate ASC NULLS LAST, c.position ASC")
    List<Card> searchCards(
            @Param("title") String title,
            @Param("priority") String priority,
            @Param("dueDate") LocalDate dueDate);
}
