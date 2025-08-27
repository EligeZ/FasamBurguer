package com.fasamBurguer.dto;

import java.util.List;
import java.io.Serializable;

public class PedidoFilaDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private List<ItemDTO> items;
    private Integer mesa; // opcional

    public List<ItemDTO> getItems() {
        return items;
    }

    public void setItems(List<ItemDTO> items) {
        this.items = items;
    }

    public Integer getMesa() {
        return mesa;
    }

    public void setMesa(Integer mesa) {
        this.mesa = mesa;
    }

    public static class ItemDTO implements Serializable {
    private static final long serialVersionUID = 1L;
        private Long id;
        private int qtd;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public int getQtd() {
            return qtd;
        }

        public void setQtd(int qtd) {
            this.qtd = qtd;
        }
    }
}