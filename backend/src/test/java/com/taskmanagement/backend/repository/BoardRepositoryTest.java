package com.taskmanagement.backend.repository;

import com.taskmanagement.backend.entity.Board;
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
class BoardRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private BoardRepository boardRepository;

    @Test
    void findAllOrdered_positionNullGoesLast() {
        Board b1 = new Board();
        b1.setTitle("Position Null");
        b1.setPosition(null);
        em.persistAndFlush(b1);

        Board b2 = new Board();
        b2.setTitle("Position 0");
        b2.setPosition(0);
        em.persistAndFlush(b2);

        List<Board> result = boardRepository.findAllOrdered();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Position 0");
        assertThat(result.get(1).getTitle()).isEqualTo("Position Null");
    }

    @Test
    void findAllOrdered_sortsByPositionAsc() {
        Board b1 = new Board();
        b1.setTitle("Third");
        b1.setPosition(2);
        em.persistAndFlush(b1);

        Board b2 = new Board();
        b2.setTitle("First");
        b2.setPosition(0);
        em.persistAndFlush(b2);

        Board b3 = new Board();
        b3.setTitle("Second");
        b3.setPosition(1);
        em.persistAndFlush(b3);

        List<Board> result = boardRepository.findAllOrdered();

        assertThat(result).extracting(Board::getTitle)
            .containsExactly("First", "Second", "Third");
    }

    @Test
    void findAllByOrderByCreatedAtAsc_returnsInInsertOrder() {
        Board b1 = new Board();
        b1.setTitle("A");
        b1.setPosition(0);
        em.persistAndFlush(b1);

        Board b2 = new Board();
        b2.setTitle("B");
        b2.setPosition(1);
        em.persistAndFlush(b2);

        List<Board> result = boardRepository.findAllByOrderByCreatedAtAsc();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("A");
        assertThat(result.get(1).getTitle()).isEqualTo("B");
    }
}
