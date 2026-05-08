package be.ucll.fs.project.repository.jdbc;

import java.util.List;

import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import be.ucll.fs.project.unit.model.*;

@Primary
@Repository
public class JdbcVulnerableRepository {
    
    private final JdbcClient jdbcClient;

    public JdbcVulnerableRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public User findUserByUsername(String username) {
        String sql = "select * from user_table u where u.username = '" + username + "'"; //directly concatenate the string into the query so that the input doesnt get checked for sql injections

        return jdbcClient
            .sql(sql)
            .query(User.class)
            .single();
    }


    public List<User> findUsersByUsername(String username) {
        String sql = "select * from user_table u where u.username = '" + username + "'"; //directly concatenate the string into the query so that the input doesnt get checked for sql injections

        return jdbcClient
            .sql(sql)
            .query(User.class)
            .list();
    }
}
