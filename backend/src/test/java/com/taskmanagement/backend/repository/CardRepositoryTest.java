package com.taskmanagement.backend.repository;

import com.taskmanagement.backend.entity.Board;
import com.taskmanagement.backend.entity.Card;
import com.taskmanagement.backend.entity.TaskList;
import com.taskmanagement.backend.TestJpaAuditingConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(TestJpaAuditingConfig.class)
class CardRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private CardRepository cardRepository;

    private TaskList taskList;

    @BeforeEach
    void setUp() {
        Board board = new Board();
        board.setTitle("Board");
        board.setPosition(0);
        em.persistAndFlush(board);

        taskList = new TaskList();
        taskList.setBoard(board);
        taskList.setTitle("List");
        taskList.setPosition(0);
        em.persistAndFlush(taskList);
    }

    private Card createCard(String title, String priority, LocalDate dueDate, int position) {
        Card card = new Card();
        card.setTaskList(taskList);
        card.setTitle(title);
        card.setPriority(priority);
        card.setDueDate(dueDate);
        card.setPosition(position);
        return em.persistAndFlush(card);
    }

    @Test
    void findByTaskListIdOrderByPosition_returnsInPositionOrder() {
        createCard("Second", null, null, 1);
        createCard("First", null, null, 0);

        List<Card> result = cardRepository.findByTaskListIdOrderByPosition(taskList.getId());

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("First");
        assertThat(result.get(1).getTitle()).isEqualTo("Second");
    }

    @Test
    void searchCards_allParamsNull_returnsAll() {
        createCard("Card A", "HIGH", LocalDate.of(2025, 1, 1), 0);
        createCard("Card B", "LOW", null, 1);

        List<Card> result = cardRepository.searchCards(null, null, null);

        assertThat(result).hasSize(2);
    }

    @Test
    void searchCards_byTitle_partialCaseInsensitive() {
        createCard("Important Task", null, null, 0);
        createCard("Other Card", null, null, 1);

        List<Card> result = cardRepository.searchCards("important", null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Important Task");
    }

    @Test
    void searchCards_byPriority_exactMatch() {
        createCard("High Card", "HIGH", null, 0);
        createCard("Low Card", "LOW", null, 1);

        List<Card> result = cardRepository.searchCards(null, "HIGH", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPriority()).isEqualTo("HIGH");
    }

    @Test
    void searchCards_byDueDate_exactMatch() {
        LocalDate target = LocalDate.of(2025, 6, 1);
        createCard("Due Today", null, target, 0);
        createCard("Due Later", null, LocalDate.of(2025, 12, 31), 1);

        List<Card> result = cardRepository.searchCards(null, null, target);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Due Today");
    }

    @Test
    void searchCards_noMatch_returnsEmpty() {
        createCard("Card A", "HIGH", null, 0);

        List<Card> result = cardRepository.searchCards("nonexistent", null, null);

        assertThat(result).isEmpty();
    }

    @Test
    void searchCards_dueDateNullGoesLast() {
        createCard("No Due", null, null, 0);
        createCard("Has Due", null, LocalDate.of(2025, 3, 1), 1);

        List<Card> result = cardRepository.searchCards(null, null, null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Has Due");
        assertThat(result.get(1).getTitle()).isEqualTo("No Due");
    }
}
