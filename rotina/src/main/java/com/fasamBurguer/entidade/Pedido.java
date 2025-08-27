package com.fasamBurguer.entidade;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "pedido_id") // Adiciona FK na tabela de burguer
    private List<Burguer> burguersPedidos;

    @OneToOne
    @JoinColumn(name = "mesa_id")
    private Usuario mesa;

    private void adicionarBurguer(Burguer burguer){
        this.burguersPedidos.add(burguer);
    }

}
