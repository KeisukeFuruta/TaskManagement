package com.taskmanagement.backend.repository;

import com.taskmanagement.backend.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {
    List<Board> findAllByOrderByCreatedAtAsc();

    @Query("SELECT b FROM Board b ORDER BY CASE WHEN b.position IS NULL THEN 1 ELSE 0 END, b.position ASC, b.createdAt ASC")
    List<Board> findAllOrdered();
}
