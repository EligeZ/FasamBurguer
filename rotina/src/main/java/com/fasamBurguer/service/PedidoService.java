package com.fasamBurguer.service;

import com.fasamBurguer.entidade.Pedido;
import com.fasamBurguer.repositorio.PedidoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository repo;

    public Pedido cadastrar(Pedido pedido){
        return repo.save(pedido);
    }

    public Pedido editar(Long id, Pedido pedido) {
        Pedido pedidoExistente = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido não encontrado!"));

        pedido.setId(id); // Garante que o ID seja mantido
        return repo.save(pedido);
    }


    public List<Pedido> findAll(){
        return repo.findAll();
    }

    public Pedido mostrarPedido(Long id){
        return repo.findById(id).orElseThrow(()-> new EntityNotFoundException("Pedido não encontrado!"));
    }

    public void excluirPedido(Long id){

        if(id == null){
            throw new RuntimeException("Pedido não encontrado!");
        }
        repo.deleteById(id);
    }
}
