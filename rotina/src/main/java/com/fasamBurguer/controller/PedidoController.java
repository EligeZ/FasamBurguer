    package com.fasamBurguer.controller;

    import com.fasamBurguer.entidade.Pedido;
    import com.fasamBurguer.service.PedidoService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("pedidos")
    // @CrossOrigin(origins = "http://localhost:3001")
    public class PedidoController {

        @Autowired
        private PedidoService service;

        @GetMapping()
        public ResponseEntity<List<Pedido>> findAll() {
            return ResponseEntity.ok(service.findAll());
        }

        @PostMapping
        public ResponseEntity<Pedido> cadastrar(Pedido pedido) {
            return new ResponseEntity<>(service.cadastrar(pedido), HttpStatus.CREATED);
        }

        @PutMapping("/{id}")
        public ResponseEntity<Pedido> editar(@PathVariable(value = "id") Long id, Pedido pedido) {
            return new ResponseEntity<>(service.editar(id, pedido), HttpStatus.OK);
        }

        @DeleteMapping
        public ResponseEntity<Void> exluir(Long id) {
            service.excluirPedido(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

    }
