package com.fasamBurguer.controller;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.fasamBurguer.dto.PedidoFilaDTO;

@RestController
@RequestMapping("/fila")
@CrossOrigin(origins = "*")
public class PedidoFilaController {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private static final String QUEUE_NAME = "orders";

    @PostMapping("/pedido")
    public ResponseEntity<String> enviarPedidoParaFila(@RequestBody PedidoFilaDTO pedido) {
        try {
            if (pedido.getItems() == null || pedido.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("O pedido precisa ter pelo menos um item.");
            }

            // ❌ Remova isso:
            // ObjectMapper mapper = new ObjectMapper();
            // String jsonPedido = mapper.writeValueAsString(pedido);

            // ✅ Agora o RabbitTemplate vai converter automaticamente
            rabbitTemplate.convertAndSend(QUEUE_NAME, pedido);

            System.out.println("📦 Pedido enviado à fila: " + pedido);

            return ResponseEntity.ok("Pedido enviado à cozinha com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao enviar pedido: " + e.getMessage());
        }
    }

}