import exprees from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error", "info", "query", "warn"] });

const app = exprees();
app.use(cors());
app.use(exprees.json());

const port = 5000;

//getting all users and their orders including each item
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { orders: { include: { item: true } } },
    });
    res.send(users);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

//get a single user by his email
app.get("/users/:email", async (req, res) => {
  const userEmail = req.params.email;
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { orders: { include: { item: true } } },
    });
    if (user) {
      res.send(user);
    } else {
      res
        .status(404)
        .send({ error: "User not found, check the email format again!" });
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

//getting all orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { item: true, user: true },
    });
    res.send(orders);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});


//get a single order
app.get('/orders/:id', async (req, res) => {
    const id = Number (req.params.id)
    
    try {
    const order = await prisma.order.findUnique({where: {id}, include: {user: true, item: true}})
    if (order) {
        res.send(order)
    } else {
        res.status(404).send({error: "Order not found! "})
    }
} catch(error) {
    //@ts-ignore
    res.status(400).send({error: error.message})
}
    
})


//delete an order
app.delete("/orders/:id", async (req, res) => {
  const orderId = Number(req.params.id);
  try {
    const order = prisma.order.findUnique({ where: { id: orderId } });

    if (order) {
      await prisma.order.delete({ where: { id: orderId } });
      const user = await prisma.user.findUnique({
        //@ts-ignore
        where: { id: order.userId },
        include: { orders: true },
      });
      res.send(user);
    } else {
        res.status(404).send({error: "Order not found"})
    }
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Click: http://localhost:${port}`);
});
