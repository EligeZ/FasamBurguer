package com.fasamBurguer.entidade;

public enum Permissao {
    COZINHA("Cozinha"), MESA("Mesa");

    private String name;

    public String getName(){
        return name;
    }

    Permissao(String name){
        this.name = name;
    }
}
