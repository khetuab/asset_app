const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const dataFilePath = "./apijsonfortest.json";

// Read JSON data from file
const readData = () => {
  const rawData = fs.readFileSync(dataFilePath);
  return JSON.parse(rawData);
};

// Write JSON data back to file
const writeData = (newData) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
};

// POST: Create a new request
app.post("/requests", (req, res) => {
  const {
    user,
    assetId,
    assetName,
    status,
    quantity,
    description,
    category,
    type,
    code,
    unitOfMeasure,
  } = req.body;

  // Validate required fields
  if (
    !user || !assetId || !assetName || !status || !quantity ||
    !description || !category || !type || !code || !unitOfMeasure
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const data = readData();

  const newRequest = {
    id: Date.now().toString(),
    user,
    assetId,
    assetName,
    status,
    quantity: parseInt(quantity),
    description,
    category,
    type,
    code,
    unitOfMeasure,
  };

  data.requests.push(newRequest);
  writeData(data);

  res.status(201).json({
    message: "Request created successfully",
    data: newRequest,
  });
});

// GET: Fetch all users
app.get("/users", (req, res) => {
  const data = readData();
  res.json(data.users);
});

// GET: Fetch all requests
app.get("/requests", (req, res) => {
  const data = readData();
  res.json(data.requests);
});

// GET: Fetch all assets
app.get("/assets", (req, res) => {
  const data = readData();
  res.json(data.assets);
});

// PATCH: Update request status
app.patch("/requests/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const data = readData();
  const requestIndex = data.requests.findIndex((r) => r.id === id);

  if (requestIndex === -1) {
    return res.status(404).json({ message: "Request not found" });
  }

  data.requests[requestIndex].status = status;
  writeData(data);

  res.status(200).json({
    message: "Request status updated",
    request: data.requests[requestIndex],
  });
});

// PATCH user profile image
app.patch("/users/:id/image", (req, res) => {
  const { id } = req.params;
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ message: "Image URL is required" });
  }

  const data = readData();
  const user = data.users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.image = image;
  writeData(data);
  res.status(200).json({ message: "Profile image updated", user });
});


// PATCH: Change user password
app.patch("/users/:id/password", (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required" });
  }

  const data = readData();
  const user = data.users.find((user) => user.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.password !== currentPassword) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = newPassword;
  writeData(data);

  res.status(200).json({
    message: "Password changed successfully",
    user: { id: user.id, username: user.username, role: user.role },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
