import amqp from "amqplib";

const QUEUE = "orders";
let channel;
let lastMsg;  // Usado para armazenar a última mensagem chamada

async function initRabbit() {
  const conn = await amqp.connect("amqp://localhost");
  channel = await conn.createChannel();
  await channel.assertQueue(QUEUE);
  console.log(`🐇 RabbitMQ conectado em amqp://localhost:5672 fila: ${QUEUE}`);
}

async function getNextOrder() {
  const msg = await channel.get(QUEUE, { noAck: false });

  if (msg) {
    lastMsg = msg;  // Armazena a última mensagem para ACK ou NACK depois
    const pedido = JSON.parse(msg.content.toString());
    console.log("📥 Pedido recebido:", pedido);
    return pedido;
  } else {
    console.log("🚫 Nenhum pedido na fila.");
    return null;
  }
}

function ackOrder() {
  if (lastMsg) {
    channel.ack(lastMsg);
    console.log("✅ Pedido ACK (entregue).");
    lastMsg = null;
  }
}

function nackOrder() {
  if (lastMsg) {
    channel.nack(lastMsg, false, false);
    console.log("❌ Pedido NACK (cancelado).");
    lastMsg = null;
  }
}

export { initRabbit, channel, QUEUE, getNextOrder, ackOrder, nackOrder };
