package com.taskmanagement.backend.repository;

import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.TestJpaAuditingConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(TestJpaAuditingConfig.class)
class TaskListRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private TaskListRepository taskListRepository;

    private Board createBoard(String title) {
        Board board = new Board();
        board.setTitle(title);
        board.setPosition(0);
        return em.persistAndFlush(board);
    }

    private TaskList createList(Board board, String title, int position) {
        TaskList list = new TaskList();
        list.setBoard(board);
        list.setTitle(title);
        list.setPosition(position);
        return em.persistAndFlush(list);
    }

    @Test
    void findByBoardIdOrderByPosition_returnsInPositionOrder() {
        Board board = createBoard("Board");
        createList(board, "Second", 1);
        createList(board, "First", 0);
        createList(board, "Third", 2);

        List<TaskList> result = taskListRepository.findByBoardIdOrderByPosition(board.getId());

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getTitle()).isEqualTo("First");
        assertThat(result.get(1).getTitle()).isEqualTo("Second");
        assertThat(result.get(2).getTitle()).isEqualTo("Third");
    }

    @Test
    void findByBoardIdOrderByPosition_excludesOtherBoards() {
        Board board1 = createBoard("Board 1");
        Board board2 = createBoard("Board 2");
        createList(board1, "List A", 0);
        createList(board2, "List B", 0);

        List<TaskList> result = taskListRepository.findByBoardIdOrderByPosition(board1.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("List A");
    }

    @Test
    void findByBoardIdOrderByPosition_returnsEmptyWhenNone() {
        Board board = createBoard("Empty Board");

        List<TaskList> result = taskListRepository.findByBoardIdOrderByPosition(board.getId());

        assertThat(result).isEmpty();
    }
}
