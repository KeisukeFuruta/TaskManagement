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

    @Query(value = "SELECT * FROM cards c WHERE " +
           "(CAST(:title AS text) IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', CAST(:title AS text), '%'))) AND " +
           "(CAST(:priority AS text) IS NULL OR c.priority = CAST(:priority AS text)) AND " +
           "(CAST(:dueDate AS date) IS NULL OR c.due_date = CAST(:dueDate AS date)) " +
           "ORDER BY c.due_date ASC NULLS LAST, c.position ASC",
           nativeQuery = true)
    List<Card> searchCards(@Param("title") String title,
                           @Param("priority") String priority,
                           @Param("dueDate") LocalDate dueDate);
}
