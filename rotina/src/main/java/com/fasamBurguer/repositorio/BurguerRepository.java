package com.fasamBurguer.repositorio;

import com.fasamBurguer.entidade.Burguer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BurguerRepository extends JpaRepository<Burguer, Long> {
}
